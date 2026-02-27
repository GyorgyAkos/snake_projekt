"""
PPO tanítás a Snake környezeten (Stable-Baselines3).
Alapértelmezetten ételorientált preset (reward_food=15, max_steps=2500, ent_coef=0.02), 800k timesteps.

Futtatás (ai_service mappából):
  python training/train_ppo.py --rows 20 --cols 20 --eval-episodes 10

Mentés:
  - models/ppo_snake_best.zip   (globális legjobb PPO modell)
  - models/ppo_snake_last.zip   (utolsó futás modellje)
  - models/ppo_snake_best_meta.json (best_mean_reward meta)
"""
import argparse
import json
import os
import sys
import shutil
from datetime import datetime

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import numpy as np
import gym
from gym import spaces
from stable_baselines3 import PPO
from stable_baselines3.common.vec_env import DummyVecEnv

from src.env.snake_env import SnakeEnv, OBSERVATION_DIM, ACTION_NAMES

# Mérsékelten ételorientált preset (docs 4.2.2, 4.5, 4.6):
# - reward_food: 10
# - reward_survival: 0
# - reward_starvation: -0.5
# - max_steps_per_episode: 2000
# Cél: stabilan evő, de nem túl agresszíven büntetett / random stratégia.
FOOD_PRESET = {
    "reward_food": 10.0,
    "reward_survival": 0.0,
    "reward_step_toward": 0.05,
    "reward_step_away": -0.05,
    "reward_starvation": -0.5,
    "max_steps_per_episode": 2000,
}
PPO_ENT_COEF = 0.01  # közel SB3 alaphoz, mérsékelt exploráció


class SnakeGymEnv(gym.Env):
    """Gym Env wrapper a SnakeEnv köré (SB3 kompatibilis)."""

    metadata = {"render_modes": []}

    def __init__(self, rows: int = 20, cols: int = 20, seed: int | None = None, use_food_preset: bool = True):
        super().__init__()
        self._rows = rows
        self._cols = cols
        self._seed = seed
        if use_food_preset:
            self.env = SnakeEnv(rows=rows, cols=cols, **FOOD_PRESET)
        else:
            self.env = SnakeEnv(rows=rows, cols=cols)
        self.observation_space = spaces.Box(
            low=-np.inf,
            high=np.inf,
            shape=(OBSERVATION_DIM,),
            dtype=np.float32,
        )
        self.action_space = spaces.Discrete(len(ACTION_NAMES))

    def reset(self, *, seed: int | None = None, options: dict | None = None):
        if seed is None:
            seed = self._seed
        obs, info = self.env.reset(seed=seed)
        return np.array(obs, dtype=np.float32), info

    def step(self, action: int):
        obs, reward, done, info = self.env.step(int(action))
        terminated = done
        truncated = False
        return np.array(obs, dtype=np.float32), float(reward), terminated, truncated, info


def backup_existing_ppo_models(model_dir: str) -> str | None:
    """
    Backupolja a meglévő PPO modelleket/configot, mielőtt az új futás felülírná őket.
    Visszaadja a backup mappa útvonalát (vagy None, ha nem volt mit menteni).
    """
    os.makedirs(model_dir, exist_ok=True)
    candidates = [
        "ppo_snake.zip",
        "ppo_snake_best.zip",
        "ppo_snake_last.zip",
        "ppo_snake_best_meta.json",
    ]
    existing = [f for f in candidates if os.path.isfile(os.path.join(model_dir, f))]
    if not existing:
        return None
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_dir = os.path.join(model_dir, "backups_ppo", ts)
    os.makedirs(backup_dir, exist_ok=True)
    for f in existing:
        shutil.copy2(os.path.join(model_dir, f), os.path.join(backup_dir, f))
    return backup_dir


def evaluate_ppo(model: PPO, rows: int, cols: int, episodes: int = 50, seed: int = 123, use_food_preset: bool = True) -> dict[str, float]:
    """Deterministic PPO értékelés; ugyanazt a környezet-presetet használja, mint a tanítás."""
    rewards: list[float] = []
    scores: list[int] = []
    steps: list[int] = []
    env_kw = {"rows": rows, "cols": cols}
    if use_food_preset:
        env_kw.update(FOOD_PRESET)
    for i in range(episodes):
        env = SnakeEnv(**env_kw)
        obs, _ = env.reset(seed=seed + i)
        obs_arr = np.array(obs, dtype=np.float32)
        done = False
        ep_reward = 0.0
        max_steps = env_kw.get("max_steps_per_episode") or 5000
        step_count = 0
        while not done and step_count < max_steps:
            action, _ = model.predict(obs_arr, deterministic=True)
            obs_next, reward, done, info = env.step(int(action))
            obs_arr = np.array(obs_next, dtype=np.float32)
            ep_reward += float(reward)
            step_count += 1
        rewards.append(ep_reward)
        scores.append(int(info.get("score", 0)))
        steps.append(int(info.get("tick", 0)))
    return {
        "eval_mean_reward": float(np.mean(rewards)),
        "eval_mean_score": float(np.mean(scores)),
        "eval_mean_steps": float(np.mean(steps)),
    }


def main():
    p = argparse.ArgumentParser(description="Train PPO on Snake env (Stable-Baselines3)")
    p.add_argument("--rows", type=int, default=20, help="Grid rows")
    p.add_argument("--cols", type=int, default=20, help="Grid cols")
    p.add_argument("--seed", type=int, default=42, help="Random seed")
    p.add_argument("--total-timesteps", type=int, default=800_000, help="Total timesteps for PPO.learn()")
    p.add_argument("--model-dir", type=str, default="models", help="Directory for PPO models")
    p.add_argument("--eval-episodes", type=int, default=10, help="Number of eval episodes after training")
    p.add_argument("--no-food-preset", action="store_true", help="Use old reward (survival-heavy, no max steps per episode)")
    args = p.parse_args()
    use_food_preset = not args.no_food_preset
    if use_food_preset:
        print("Using food-oriented preset: reward_food=10, max_steps=2000, reward_starvation=-0.5, ent_coef=0.01")
    else:
        print("Using default (survival) preset: no episode step limit")

    os.makedirs(args.model_dir, exist_ok=True)

    backup_dir = backup_existing_ppo_models(args.model_dir)
    if backup_dir:
        print(f"Backed up existing PPO models to: {backup_dir}")

    best_meta_path = os.path.join(args.model_dir, "ppo_snake_best_meta.json")
    best_mean_reward = float("-inf")
    if os.path.isfile(best_meta_path):
        try:
            with open(best_meta_path) as f:
                meta = json.load(f)
            prev_best = float(meta.get("best_mean_reward", float("-inf")))
            best_mean_reward = max(best_mean_reward, prev_best)
            print(f"Loaded previous PPO best_mean_reward={best_mean_reward:.2f} from {best_meta_path}")
        except Exception:
            pass

    def make_env():
        def _thunk():
            return SnakeGymEnv(rows=args.rows, cols=args.cols, seed=args.seed, use_food_preset=use_food_preset)
        return _thunk

    vec_env = DummyVecEnv([make_env()])
    ppo_kw = {"verbose": 1, "seed": args.seed}
    if use_food_preset:
        ppo_kw["ent_coef"] = PPO_ENT_COEF
    model = PPO("MlpPolicy", vec_env, **ppo_kw)

    print(f"Training PPO for {args.total_timesteps} timesteps on {args.rows}x{args.cols} grid...")
    model.learn(total_timesteps=args.total_timesteps)

    last_path = os.path.join(args.model_dir, "ppo_snake_last.zip")
    model.save(last_path)
    print(f"Saved last PPO model to {last_path}")

    if args.eval_episodes > 0:
        eval_res = evaluate_ppo(model, rows=args.rows, cols=args.cols, episodes=args.eval_episodes, seed=args.seed + 10_000, use_food_preset=use_food_preset)
        print(
            f"Eval PPO: mean_reward={eval_res['eval_mean_reward']:.2f}, "
            f"mean_score={eval_res['eval_mean_score']:.2f}, "
            f"mean_steps={eval_res['eval_mean_steps']:.1f}"
        )
        if eval_res["eval_mean_reward"] > best_mean_reward:
            best_mean_reward = eval_res["eval_mean_reward"]
            best_path = os.path.join(args.model_dir, "ppo_snake_best.zip")
            compat_best_path = os.path.join(args.model_dir, "ppo_snake.zip")
            model.save(best_path)
            model.save(compat_best_path)
            with open(best_meta_path, "w") as f:
                json.dump({"best_mean_reward": best_mean_reward}, f, indent=2)
            print(f"  -> saved best PPO model to {best_path} (best_mean_reward {best_mean_reward:.2f})")


if __name__ == "__main__":
    main()

