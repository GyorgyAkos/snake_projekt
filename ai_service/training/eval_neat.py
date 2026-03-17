"""
NEAT modell kiértékelése (tanítás nélkül).
Betölti a models/neat_snake_best.pkl modellt, N epizódot futtat,
és kiírja az átlag reward/score/steps értékeket.

Futtatás (ai_service, venv):
  python training/eval_neat.py --episodes 50
"""
import argparse
import os
import pickle
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import neat  # type: ignore[import-untyped]
import numpy as np

from src.env.snake_env import SnakeEnv, state_to_observation, ACTION_NAMES, DIR_TO_ACTION, opposite_action_index


def load_best_neat(model_dir: str) -> tuple[neat.nn.FeedForwardNetwork, str] | tuple[None, str]:
    path = os.path.join(model_dir, "neat_snake_best.pkl")
    if not os.path.isfile(path):
        return None, f"Model not found: {path}"
    try:
        with open(path, "rb") as f:
            data = pickle.load(f)
        genome = data.get("genome")
        config_path = data.get("config_path")
        if genome is None or config_path is None or not os.path.isfile(config_path):
            return None, "Invalid neat_snake_best.pkl or missing config_path"
        config = neat.Config(
            neat.DefaultGenome,
            neat.DefaultReproduction,
            neat.DefaultSpeciesSet,
            neat.DefaultStagnation,
            config_path,
        )
        net = neat.nn.FeedForwardNetwork.create(genome, config)
        return net, ""
    except Exception as e:
        return None, f"Failed to load NEAT model: {e}"


def evaluate_neat(net: neat.nn.FeedForwardNetwork, rows: int, cols: int, episodes: int = 50, seed: int = 123):
    rewards: list[float] = []
    scores: list[int] = []
    steps: list[int] = []
    for i in range(episodes):
        env = SnakeEnv(rows=rows, cols=cols)
        obs, _ = env.reset(seed=seed + i)
        done = False
        ep_reward = 0.0
        step_count = 0
        while not done and step_count < 5000:
            x = np.asarray(obs, dtype=np.float32)
            out = net.activate(x.tolist())
            if not out or len(out) < 4:
                # fallback: menjünk tovább az aktuális irányba
                action_idx = DIR_TO_ACTION.get(env._state.direction if env._state else "Right", 1)  # type: ignore[attr-defined]
            else:
                cur_idx = DIR_TO_ACTION.get(env._state.direction if env._state else "Right", 1)  # type: ignore[attr-defined]
                invalid = opposite_action_index(cur_idx)
                scores_vec = list(out)
                if invalid < len(scores_vec):
                    scores_vec[invalid] = -1e9
                action_idx = int(max(range(len(scores_vec)), key=lambda j: scores_vec[j]))
            obs, reward, done, info = env.step(int(action_idx))
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
    p = argparse.ArgumentParser(description="Eval NEAT model (no training)")
    p.add_argument("--rows", type=int, default=20)
    p.add_argument("--cols", type=int, default=20)
    p.add_argument("--episodes", type=int, default=50)
    p.add_argument("--seed", type=int, default=123)
    p.add_argument("--model-dir", type=str, default="models")
    args = p.parse_args()

    net, err = load_best_neat(args.model_dir)
    if net is None:
        print(err)
        sys.exit(1)

    res = evaluate_neat(net, rows=args.rows, cols=args.cols, episodes=args.episodes, seed=args.seed)
    print(
        f"Eval NEAT ({args.episodes} episodes): "
        f"mean_reward={res['eval_mean_reward']:.2f}, "
        f"mean_score={res['eval_mean_score']:.2f}, "
        f"mean_steps={res['eval_mean_steps']:.1f}"
    )


if __name__ == "__main__":
    main()

