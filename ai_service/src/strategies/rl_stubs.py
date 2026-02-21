"""
Placeholder stratégiák a docs/ai_docs-ban felsorolt RL és neuroevolution megközelítésekhez.
Tanulás / modell betöltés nélkül a Greedy (biztonság első) fallbacket használják.
A valódi megvalósításhoz: DQN/PPO/NEAT modell betöltése és inference.
"""
from ..state import GameState, Direction
from .base import Strategy
from .greedy import GreedyStrategy


class DQNStrategy(Strategy):
    """
    Placeholder: Q-learning / DQN (Deep Q-Network).
    Tanulás után a neurális háló a Q értékek alapján választana.
    Jelenleg: Greedy (biztonság első) fallback.
    """

    def __init__(self):
        self._fallback = GreedyStrategy()

    def next_move(self, state: GameState) -> Direction:
        return self._fallback.next_move(state)


class PPOStrategy(Strategy):
    """
    Placeholder: PPO / A2C (pl. Stable-Baselines3).
    Tanulás után a policy háló közvetlenül akciót adna.
    Jelenleg: Greedy fallback.
    """

    def __init__(self):
        self._fallback = GreedyStrategy()

    def next_move(self, state: GameState) -> Direction:
        return self._fallback.next_move(state)


class NeuroevolutionStrategy(Strategy):
    """
    Placeholder: Neuroevolution (pl. NEAT) – evolúció a súlyokra.
    Tanulás után az evolvált háló döntene.
    Jelenleg: Greedy fallback.
    """

    def __init__(self):
        self._fallback = GreedyStrategy()

    def next_move(self, state: GameState) -> Direction:
        return self._fallback.next_move(state)
