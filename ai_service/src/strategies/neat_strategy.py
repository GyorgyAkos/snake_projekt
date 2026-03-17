"""
NEAT alapú stratégia: evolvált háló betöltése és inference.
Ha nincs modell vagy neat-python, Greedy fallback.
"""
import os
import pickle
from typing import Any

from ..state import GameState, Direction
from ..env.snake_env import (
    state_to_observation,
    OBSERVATION_DIM,
    ACTION_NAMES,
    DIR_TO_ACTION,
    opposite_action_index,
)
from .base import Strategy
from .greedy import GreedyStrategy

try:
    import neat  # type: ignore[import-untyped]
except ImportError:
    neat = None  # type: ignore[assignment]


def _default_model_dir() -> str:
    base = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    return os.path.join(base, "models")


def _load_neat_model(model_dir: str | None = None):
    if neat is None:
        return None
    model_dir = model_dir or _default_model_dir()
    path = os.path.join(model_dir, "neat_snake_best.pkl")
    if not os.path.isfile(path):
        return None
    try:
        with open(path, "rb") as f:
            data = pickle.load(f)
        genome = data.get("genome")
        config_path = data.get("config_path")
        if genome is None or config_path is None or not os.path.isfile(config_path):
            return None
        config = neat.Config(
            neat.DefaultGenome,
            neat.DefaultReproduction,
            neat.DefaultSpeciesSet,
            neat.DefaultStagnation,
            config_path,
        )
        net = neat.nn.FeedForwardNetwork.create(genome, config)
        return net
    except Exception:
        return None


class NEATStrategy(Strategy):
    """
    NEAT: evolvált háló (feedforward net) → kimenetek → argmax → irány.
    Ha nincs modell vagy neat, Greedy fallback.
    """

    def __init__(self, model_dir: str | None = None):
        self._model_dir = model_dir
        self._net: Any | None = _load_neat_model(model_dir)
        self._fallback = GreedyStrategy()

    def next_move(self, state: GameState) -> Direction:
        if self._net is None:
            return self._fallback.next_move(state)
        obs = state_to_observation(state)
        # NEAT háló: bemenet OBSERVATION_DIM, kimenet 4 akció logit
        out = self._net.activate(obs)
        if not out or len(out) < 4:
            return self._fallback.next_move(state)
        # tiltjuk a 180°-os fordulatot
        cur_idx = DIR_TO_ACTION.get(state.direction, 1)
        invalid = opposite_action_index(cur_idx)
        scores = list(out)
        if invalid < len(scores):
            scores[invalid] = -1e9
        action_idx = int(max(range(len(scores)), key=lambda i: scores[i]))
        if action_idx < 0 or action_idx >= len(ACTION_NAMES):
            return self._fallback.next_move(state)
        return ACTION_NAMES[action_idx]

