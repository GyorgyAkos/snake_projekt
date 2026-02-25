"""
DQN tanítás a Snake környezetben.
Futtatás: ai_service mappából: PYTHONPATH=src python training/train_dqn.py [--episodes 5000]
Mentés: models/dqn_snake.pt + models/dqn_snake_config.json
"""
import argparse
import json
import os
import sys

# Az ai_service mappa legyen a path-on, hogy a src csomag relatív importjai működjenek
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np

from src.env.snake_env import (
    SnakeEnv,
    OBSERVATION_DIM,
    ACTION_NAMES,
    opposite_action_index,
)


class DQN(nn.Module):
    def __init__(self, obs_dim: int, n_actions: int, hidden: tuple[int, ...] = (128, 128)):
        super().__init__()
        self.obs_dim = obs_dim
        self.n_actions = n_actions
        layers = []
        prev = obs_dim
        for h in hidden:
            layers.extend([nn.Linear(prev, h), nn.ReLU()])
            prev = h
        layers.append(nn.Linear(prev, n_actions))
        self.net = nn.Sequential(*layers)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x)


class ReplayBuffer:
    def __init__(self, capacity: int, obs_dim: int):
        self.capacity = capacity
        self.obs = np.zeros((capacity, obs_dim), dtype=np.float32)
        self.actions = np.zeros(capacity, dtype=np.int64)
        self.rewards = np.zeros(capacity, dtype=np.float32)
        self.next_obs = np.zeros((capacity, obs_dim), dtype=np.float32)
        self.dones = np.zeros(capacity, dtype=np.float32)
        self.pos = 0
        self.size = 0

    def push(self, obs: np.ndarray, action: int, reward: float, next_obs: np.ndarray, done: bool):
        self.obs[self.pos] = obs
        self.actions[self.pos] = action
        self.rewards[self.pos] = reward
        self.next_obs[self.pos] = next_obs
        self.dones[self.pos] = float(done)
        self.pos = (self.pos + 1) % self.capacity
        self.size = min(self.size + 1, self.capacity)

    def sample(self, batch_size: int) -> tuple[torch.Tensor, ...]:
        idx = np.random.randint(0, self.size, size=batch_size)
        return (
            torch.from_numpy(self.obs[idx]),
            torch.from_numpy(self.actions[idx]),
            torch.from_numpy(self.rewards[idx]),
            torch.from_numpy(self.next_obs[idx]),
            torch.from_numpy(self.dones[idx]),
        )


def train(
    env: SnakeEnv,
    episodes: int = 5000,
    batch_size: int = 64,
    gamma: float = 0.99,
    lr: float = 1e-3,
    buffer_size: int = 50_000,
    target_update_every: int = 200,
    epsilon_start: float = 1.0,
    epsilon_end: float = 0.05,
    epsilon_decay_fraction: float = 0.8,
    save_every: int = 500,
    model_dir: str = "models",
    seed: int | None = 42,
    load_path: str | None = None,
    use_double_dqn: bool = True,
):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    obs_dim = OBSERVATION_DIM
    n_actions = 4

    policy_net = DQN(obs_dim, n_actions).to(device)
    target_net = DQN(obs_dim, n_actions).to(device)
    if load_path and os.path.isfile(load_path):
        try:
            state_dict = torch.load(load_path, map_location=device, weights_only=True)
        except TypeError:
            state_dict = torch.load(load_path, map_location=device)
        policy_net.load_state_dict(state_dict)
        target_net.load_state_dict(policy_net.state_dict())
        print(f"Loaded model from {load_path}")
    else:
        target_net.load_state_dict(policy_net.state_dict())
    optimizer = optim.Adam(policy_net.parameters(), lr=lr)

    buffer = ReplayBuffer(buffer_size, obs_dim)
    total_steps = 0
    best_mean_reward = float("-inf")
    episode_rewards: list[float] = []

    os.makedirs(model_dir, exist_ok=True)
    config_path = os.path.join(model_dir, "dqn_snake_config.json")

    for episode in range(episodes):
        obs, _ = env.reset(seed=seed if seed is not None else episode)
        obs_arr = np.array(obs, dtype=np.float32)
        ep_reward = 0.0
        done = False

        while not done:
            invalid_action = opposite_action_index(env.current_direction_index())
            progress = min(1.0, episode / max(1, epsilon_decay_fraction * episodes))
            epsilon = max(epsilon_end, epsilon_start - (epsilon_start - epsilon_end) * progress)
            valid_actions = [a for a in range(n_actions) if a != invalid_action]
            if np.random.random() < epsilon:
                action = int(env._rng.choice(valid_actions))
            else:
                with torch.no_grad():
                    t = torch.from_numpy(obs_arr).unsqueeze(0).to(device)
                    q = policy_net(t).clone()
                    q[0, invalid_action] = -1e9
                    action = int(q.argmax(dim=1).item())
            action = int(np.clip(action, 0, n_actions - 1))
            if action == invalid_action:
                action = valid_actions[0]

            next_obs, reward, done, info = env.step(action)
            next_arr = np.array(next_obs, dtype=np.float32)
            buffer.push(obs_arr, action, reward, next_arr, done)
            obs_arr = next_arr
            ep_reward += reward
            total_steps += 1

            if buffer.size >= batch_size:
                o, a, r, no, d = buffer.sample(batch_size)
                o = o.to(device)
                a = a.to(device).clamp(0, n_actions - 1)
                r = r.to(device)
                no = no.to(device)
                d = d.to(device)
                q = policy_net(o).gather(1, a.unsqueeze(1).long()).squeeze(1)
                with torch.no_grad():
                    if use_double_dqn:
                        next_actions = policy_net(no).argmax(1, keepdim=True)
                        next_q = target_net(no).gather(1, next_actions).squeeze(1)
                    else:
                        next_q = target_net(no).max(1)[0]
                    target = r + gamma * next_q * (1 - d)
                loss = nn.functional.mse_loss(q, target)
                optimizer.zero_grad()
                loss.backward()
                optimizer.step()

            if total_steps % target_update_every == 0:
                target_net.load_state_dict(policy_net.state_dict())

        episode_rewards.append(ep_reward)
        mean_100 = np.mean(episode_rewards[-100:]) if episode_rewards else 0.0
        if episode % 100 == 0 or episode == episodes - 1:
            print(f"ep {episode} reward {ep_reward:.1f} mean100 {mean_100:.2f} eps {epsilon:.3f}")

        if mean_100 > best_mean_reward:
            best_mean_reward = mean_100
            path = os.path.join(model_dir, "dqn_snake.pt")
            torch.save(policy_net.state_dict(), path)
            with open(config_path, "w") as f:
                json.dump({"obs_dim": obs_dim, "n_actions": n_actions, "hidden": [128, 128]}, f, indent=2)
            if episode % 500 == 0 and episode > 0:
                print(f"  -> saved {path} (best mean100 {best_mean_reward:.2f})")

        if save_every and (episode + 1) % save_every == 0:
            path = os.path.join(model_dir, "dqn_snake.pt")
            torch.save(policy_net.state_dict(), path)
            with open(config_path, "w") as f:
                json.dump({"obs_dim": obs_dim, "n_actions": n_actions, "hidden": [128, 128]}, f, indent=2)
            print(f"  -> checkpoint {path}")

    print(f"Done. Best mean100 reward: {best_mean_reward:.2f}")
    return policy_net


def main():
    p = argparse.ArgumentParser(description="Train DQN on Snake env")
    p.add_argument("--episodes", type=int, default=25000, help="Training episodes (single stage)")
    p.add_argument("--rows", type=int, default=20, help="Grid rows")
    p.add_argument("--cols", type=int, default=20, help="Grid cols")
    p.add_argument("--seed", type=int, default=42, help="Random seed")
    p.add_argument("--model-dir", type=str, default="models", help="Directory for model and config")
    p.add_argument("--curriculum", action="store_true", help="Curriculum: first 12x12 (10k ep), then 20x20 (15k ep)")
    args = p.parse_args()

    if args.curriculum:
        model_path = os.path.join(args.model_dir, "dqn_snake.pt")
        print("=== Stage 1: 12x12, 10000 episodes ===")
        env_small = SnakeEnv(rows=12, cols=12)
        train(
            env_small,
            episodes=10000,
            seed=args.seed,
            model_dir=args.model_dir,
            save_every=1000,
        )
        print("=== Stage 2: 20x20, 15000 episodes (loading from stage 1) ===")
        env_full = SnakeEnv(rows=20, cols=20)
        train(
            env_full,
            episodes=15000,
            seed=args.seed + 1,
            model_dir=args.model_dir,
            load_path=model_path,
            lr=5e-4,
            save_every=1000,
        )
    else:
        env = SnakeEnv(rows=args.rows, cols=args.cols)
        train(
            env,
            episodes=args.episodes,
            seed=args.seed,
            model_dir=args.model_dir,
        )


if __name__ == "__main__":
    main()
