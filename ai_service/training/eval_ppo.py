"""
PPO modell kiértékelése (tanítás nélkül).
Betölti a models/ppo_snake_last.zip (vagy megadott fájl) modellt,
N epizódot futtat determinisztikusan, kiírja az átlag reward/score/steps-et.
Opcionálisan menti best-ként, ha jobb mint a korábbi.
Futtatás (ai_service, venv): python training/eval_ppo.py [--episodes 10] [--model models/ppo_snake_last.zip]
"""
import argparse
import json
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import numpy as np
from stable_baselines3 import PPO

from src.env.snake_env import SnakeEnv


# Maximális lépés epizódonként (megakadályozza a végtelen futást tele tábla / ciklus esetén)
MAX_STEPS_PER_EPISODE = 2000


def evaluate_ppo(model_path: str, rows: int = 20, cols: int = 20, episodes: int = 10, seed: int = 123, max_steps: int = MAX_STEPS_PER_EPISODE):
    model = PPO.load(model_path)
    rewards, scores, steps = [], [], []
    for i in range(episodes):
        env = SnakeEnv(rows=rows, cols=cols)
        obs, _ = env.reset(seed=seed + i)
        obs_arr = np.array(obs, dtype=np.float32)
        done = False
        ep_reward = 0.0
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
    p = argparse.ArgumentParser(description="Eval PPO model (no training)")
    p.add_argument("--model", type=str, default=None, help="Path to .zip (default: models/ppo_snake_last.zip)")
    p.add_argument("--rows", type=int, default=20)
    p.add_argument("--cols", type=int, default=20)
    p.add_argument("--episodes", type=int, default=10)
    p.add_argument("--max-steps", type=int, default=MAX_STEPS_PER_EPISODE, help="Max steps per episode (prevents infinite runs)")
    p.add_argument("--seed", type=int, default=123)
    p.add_argument("--save-best", action="store_true", help="If eval mean_reward > best in meta, save as ppo_snake.zip and update meta")
    p.add_argument("--model-dir", type=str, default="models")
    args = p.parse_args()

    model_path = args.model or os.path.join(args.model_dir, "ppo_snake_last.zip")
    if not os.path.isfile(model_path):
        print(f"Model not found: {model_path}")
        sys.exit(1)

    res = evaluate_ppo(model_path, rows=args.rows, cols=args.cols, episodes=args.episodes, seed=args.seed, max_steps=args.max_steps)
    print(f"Eval PPO ({args.episodes} episodes): mean_reward={res['eval_mean_reward']:.2f}, mean_score={res['eval_mean_score']:.2f}, mean_steps={res['eval_mean_steps']:.1f}")

    if args.save_best:
        meta_path = os.path.join(args.model_dir, "ppo_snake_best_meta.json")
        best = float("-inf")
        if os.path.isfile(meta_path):
            try:
                with open(meta_path) as f:
                    best = float(json.load(f).get("best_mean_reward", float("-inf")))
            except Exception:
                pass
        if res["eval_mean_reward"] > best:
            model = PPO.load(model_path)
            best_path = os.path.join(args.model_dir, "ppo_snake_best.zip")
            compat_path = os.path.join(args.model_dir, "ppo_snake.zip")
            model.save(best_path)
            model.save(compat_path)
            with open(meta_path, "w") as f:
                json.dump({"best_mean_reward": res["eval_mean_reward"]}, f, indent=2)
            print(f"  -> saved best to {compat_path} (best_mean_reward={res['eval_mean_reward']:.2f})")


if __name__ == "__main__":
    main()
