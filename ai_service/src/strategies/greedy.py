"""
Greedy „biztonság első” stratégia: mindig azt a lépést választja,
ahol a legtöbb szabad cella érhető el (flood fill). Nem megy kockázatosan az étel felé.
"""
from ..state import GameState, Direction
from .base import Strategy
from .astar import safest_local_step


class GreedyStrategy(Strategy):
    """Mindig a legbiztonságosabb lokális lépés (maximális szabadságfok)."""

    def next_move(self, state: GameState) -> Direction:
        return safest_local_step(state)
