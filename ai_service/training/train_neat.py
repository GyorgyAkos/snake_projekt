"""
NEAT (neuroevolution) tanítás a Snake környezeten.

Futtatás (ai_service mappából, venv-ben):
  python training/train_neat.py --rows 20 --cols 20 --generations 50 > ..\docs\neat_results.txt

Mentés:
  - models/neat_snake_best.pkl   (legjobb genom + config)
"""
import argparse
import os
import pickle
import sys
from typing import Any

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import neat  # type: ignore[import-untyped]
import numpy as np

from src.env.snake_env import SnakeEnv, state_to_observation, OBSERVATION_DIM, ACTION_NAMES


def make_env(rows: int, cols: int) -> SnakeEnv:
    # NEAT-hez érdemes enyhén ételorientált, de nem túl agresszív rewardot használni.
    return SnakeEnv(rows=rows, cols=cols, reward_food=1.0, reward_survival=0.01, reward_starvation=-0.5, max_steps_per_episode=2000)


def eval_genome(genome: Any, config: neat.Config, rows: int, cols: int, episodes: int = 5) -> float:
    net = neat.nn.FeedForwardNetwork.create(genome, config)
    total_fitness = 0.0
    for ep in range(episodes):
        env = make_env(rows, cols)
        obs, _ = env.reset(seed=42 + ep)
        done = False
        steps = 0
        while not done and steps < 5000:
            x = np.asarray(obs, dtype=np.float32)
            out = net.activate(x.tolist())
            # 4 kimenet: Up, Right, Down, Left
            action_idx = int(np.argmax(out))
            obs, reward, done, info = env.step(action_idx)
            total_fitness += reward
            steps += 1
        # plusz jutalom a score-ra (ha reward shaping nem ad elég különbséget)
        total_fitness += float(info.get("score", 0)) * 10.0
    return total_fitness / episodes


def eval_genomes(genomes, config, rows: int, cols: int):
    for _, genome in genomes:
        genome.fitness = eval_genome(genome, config, rows=rows, cols=cols)


def default_config_path() -> str:
    base = os.path.dirname(__file__)
    return os.path.join(base, "neat_config_snake.ini")


def ensure_default_config(path: str):
    if os.path.isfile(path):
        return
    # Minimális, általános config; szükség esetén kézzel finomhangolható.
    contents = f"""
[NEAT]
fitness_criterion       = max
fitness_threshold       = 100.0
pop_size                = 150
reset_on_extinction     = False
no_fitness_termination  = False

[DefaultGenome]
activation_default      = tanh
activation_mutate_rate  = 0.0
activation_options      = tanh

aggregation_default     = sum
aggregation_mutate_rate = 0.0
aggregation_options     = sum

bias_init_mean          = 0.0
bias_init_stdev         = 1.0
bias_max_value          = 30.0
bias_min_value          = -30.0
bias_mutate_power       = 0.5
bias_mutate_rate        = 0.7
bias_replace_rate       = 0.1

compatibility_disjoint_coefficient = 1.0
compatibility_weight_coefficient   = 0.5

conn_add_prob           = 0.5
conn_delete_prob        = 0.3

enabled_default         = True
enabled_mutate_rate     = 0.01

initial_connection      = full_direct

num_hidden              = 0
num_inputs              = {OBSERVATION_DIM}
num_outputs             = 4
feed_forward            = True
node_add_prob           = 0.2
node_delete_prob        = 0.2

response_init_mean      = 1.0
response_init_stdev     = 0.0
response_max_value      = 30.0
response_min_value      = -30.0
response_mutate_power   = 0.0
response_mutate_rate    = 0.0
response_replace_rate   = 0.0

weight_init_mean        = 0.0
weight_init_stdev       = 1.0
weight_max_value        = 30.0
weight_min_value        = -30.0
weight_mutate_power     = 0.5
weight_mutate_rate      = 0.8
weight_replace_rate     = 0.1

[DefaultSpeciesSet]
compatibility_threshold = 3.0

[DefaultStagnation]
species_fitness_func = max
max_stagnation       = 15
species_elitism      = 2

[DefaultReproduction]
elitism            = 2
survival_threshold = 0.2
"""
    with open(path, "w", encoding="utf-8") as f:
        f.write(contents.strip() + "\n")


def main():
    p = argparse.ArgumentParser(description="Train NEAT on Snake env")
    p.add_argument("--rows", type=int, default=20)
    p.add_argument("--cols", type=int, default=20)
    p.add_argument("--generations", type=int, default=50)
    p.add_argument("--config", type=str, default=None, help="Optional neat config path")
    p.add_argument("--model-dir", type=str, default="models")
    args = p.parse_args()

    os.makedirs(args.model_dir, exist_ok=True)

    config_path = args.config or default_config_path()
    ensure_default_config(config_path)
    print(f"Using NEAT config: {config_path}")

    config = neat.Config(
        neat.DefaultGenome,
        neat.DefaultReproduction,
        neat.DefaultSpeciesSet,
        neat.DefaultStagnation,
        config_path,
    )

    pop = neat.Population(config)
    pop.add_reporter(neat.StdOutReporter(True))
    stats = neat.StatisticsReporter()
    pop.add_reporter(stats)

    print(f"Training NEAT for {args.generations} generations on {args.rows}x{args.cols} grid...")
    winner = pop.run(lambda genomes, cfg: eval_genomes(genomes, cfg, args.rows, args.cols), n=args.generations)

    # Globális best kezelés: csak akkor írjuk felül a best modellt,
    # ha az új winner fitness-e jobb, mint a korábbi best.
    best_meta_path = os.path.join(args.model_dir, "neat_snake_best_meta.json")
    prev_best_fitness = float("-inf")
    if os.path.isfile(best_meta_path):
        try:
            with open(best_meta_path, "r", encoding="utf-8") as f:
                meta = pickle.load(f)
            prev_best_fitness = float(meta.get("best_fitness", float("-inf")))
        except Exception:
            prev_best_fitness = float("-inf")

    winner_fitness = float(getattr(winner, "fitness", 0.0) or 0.0)
    print(f"Winner fitness this run: {winner_fitness:.2f} (previous best: {prev_best_fitness:.2f})")

    if winner_fitness > prev_best_fitness:
        best_path = os.path.join(args.model_dir, "neat_snake_best.pkl")
        with open(best_path, "wb") as f:
            pickle.dump({"genome": winner, "config_path": config_path}, f)
        with open(best_meta_path, "wb") as f:
            pickle.dump({"best_fitness": winner_fitness}, f)
        print(f"Saved new best NEAT genome to {best_path} (best_fitness={winner_fitness:.2f})")
    else:
        print("Winner did not beat previous best NEAT fitness; keeping existing best model.")


if __name__ == "__main__":
    main()

