"""
DQN stratégia: betanított modell betöltése és inference.
Ha nincs models/dqn_snake.pt (vagy DQN_MODEL_DIR), Greedy fallback.
"""
import json
import os
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

# PyTorch lazy import (optional dependency)
torch: Any = None


def _get_torch():
    global torch
    if torch is None:
        try:
            import torch as t
            torch = t
        except ImportError:
            pass
    return torch


def _default_model_dir() -> str:
    base = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    return os.path.join(base, "models")


def _load_dqn_model(model_dir: str | None = None):
    """Betölti a DQN modellt és konfigot. Ha nincs fájl vagy torch, None."""
    t = _get_torch()
    if t is None:
        return None
    model_dir = model_dir or os.environ.get("DQN_MODEL_DIR") or _default_model_dir()
    pt_path = os.path.join(model_dir, "dqn_snake.pt")
    config_path = os.path.join(model_dir, "dqn_snake_config.json")
    if not os.path.isfile(pt_path) or not os.path.isfile(config_path):
        return None
    try:
        with open(config_path) as f:
            config = json.load(f)
        obs_dim = config.get("obs_dim", OBSERVATION_DIM)
        n_actions = config.get("n_actions", 4)
        hidden = tuple(config.get("hidden", [128, 128]))

        class DQN(t.Module):
            def __init__(self):
                super().__init__()
                layers = []
                prev = obs_dim
                for h in hidden:
                    layers.extend([t.nn.Linear(prev, h), t.nn.ReLU()])
                    prev = h
                layers.append(t.nn.Linear(prev, n_actions))
                self.net = t.nn.Sequential(*layers)

            def forward(self, x):
                return self.net(x)

        model = DQN()
        try:
            state_dict = t.load(pt_path, map_location="cpu", weights_only=True)
        except TypeError:
            state_dict = t.load(pt_path, map_location="cpu")
        model.load_state_dict(state_dict)
        model.eval()
        return model
    except Exception:
        return None


class DQNStrategy(Strategy):
    """
    DQN: betanított modell alapján Q értékek → argmax → irány.
    Ha nincs modell vagy torch: Greedy (biztonság első) fallback.
    """

    def __init__(self, model_dir: str | None = None):
        self._model_dir = model_dir
        self._model = _load_dqn_model(model_dir)
        self._fallback = GreedyStrategy()

    def next_move(self, state: GameState) -> Direction:
        if self._model is None:
            return self._fallback.next_move(state)
        t = _get_torch()
        if t is None:
            return self._fallback.next_move(state)
        obs = state_to_observation(state)
        with t.no_grad():
            x = t.tensor([obs], dtype=t.float32)
            q = self._model(x).clone()
            cur_idx = DIR_TO_ACTION.get(state.direction, 1)
            invalid = opposite_action_index(cur_idx)
            q[0, invalid] = -1e9
            action = int(q.argmax(dim=1).item())
        return ACTION_NAMES[action]
