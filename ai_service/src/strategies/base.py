"""
Stratégia interfész – spec 7.5.2, 7.18: next_move(state) -> Action.
"""
from abc import ABC, abstractmethod

from ..state import GameState, Direction


class Strategy(ABC):
    @abstractmethod
    def next_move(self, state: GameState) -> Direction:
        """Következő lépés iránya (nem lehet 180° ellentétes a jelenlegi iránnyal)."""
        pass
