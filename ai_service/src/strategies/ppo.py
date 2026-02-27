"""
Valódi PPO stratégia Stable-Baselines3 modellel.

Ha a models/ppo_snake.zip (vagy ppo_snake_best.zip) elérhető és a stable-baselines3 telepítve van,
akkor a betanított PPO policy adja az akciót. Egyébként Greedy fallback.
"""
import os
from typing import Any

import numpy as np

from ..state import GameState, Direction
from ..env.snake_env import state_to_observation, ACTION_NAMES, DIR_TO_ACTION, opposite_action_index
from .base import Strategy
from .greedy import GreedyStrategy

_ppo_lib: Any = None


def _get_ppo():
    global _ppo_lib
    if _ppo_lib is None:
        try:
            from stable_baselines3 import PPO as PPOClass  # type: ignore
            _ppo_lib = PPOClass
        except Exception:
            _ppo_lib = False
    return _ppo_lib


def _default_model_dir() -> str:
    base = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    return os.path.join(base, "models")


def _load_ppo_model(model_dir: str | None = None):
    PPOClass = _get_ppo()
    if not PPOClass:
        return None
    model_dir = model_dir or _default_model_dir()
    # Először próbáljuk a „best” modellt, majd a kompatibilis ppo_snake.zip-et.
    candidates = [
        os.path.join(model_dir, "ppo_snake_best.zip"),
        os.path.join(model_dir, "ppo_snake.zip"),
    ]
    path = next((p for p in candidates if os.path.isfile(p)), None)
    if path is None:
        return None
    try:
        model = PPOClass.load(path)
        return model
    except Exception:
        return None


class PPOStrategy(Strategy):
    """
    PPO stratégia Stable-Baselines3 modellel.
    Ha nincs modell vagy PPO lib, akkor Greedy fallback.
    """

    def __init__(self, model_dir: str | None = None):
        self._model_dir = model_dir
        self._model = _load_ppo_model(model_dir)
        self._fallback = GreedyStrategy()

    def next_move(self, state: GameState) -> Direction:
        if self._model is None:
            return self._fallback.next_move(state)
        obs = np.array(state_to_observation(state), dtype=np.float32)
        try:
            action, _ = self._model.predict(obs, deterministic=True)
            a = int(action)
        except Exception:
            return self._fallback.next_move(state)
        # Érvénytelen index esetén fallback az aktuális irányra.
        if a < 0 or a >= len(ACTION_NAMES):
            return state.direction
        # Tiltjuk az ellentétes irányt (180°)
        cur_idx = DIR_TO_ACTION.get(state.direction, 1)
        invalid = opposite_action_index(cur_idx)
        if a == invalid:
            return self._fallback.next_move(state)
        return ACTION_NAMES[a]

