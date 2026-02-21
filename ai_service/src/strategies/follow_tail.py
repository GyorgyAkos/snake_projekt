"""
Farok-követés: ha az étel felé menni kockázatos, a kígyó a farok felé megy
(biztonságos útvonalon), így „körbe jár” és kerüli a falat.
"""
from ..state import GameState, Direction, OPPOSITE
from .base import Strategy
from .astar import direction_from_to, path_to_tail, safest_local_step


class FollowTailStrategy(Strategy):
    """Először étel felé (A*), ha nincs biztonságos út: farok felé, különben legbiztonságosabb lépés."""

    def next_move(self, state: GameState) -> Direction:
        from .astar import astar_path

        head = state.head
        food = state.food
        body = state.body_set(exclude_tail=True)

        if food and state.in_bounds(*food):
            path = astar_path(head, food, body, state.rows, state.cols)
            if path and len(path) >= 2:
                next_cell = path[1]
                if state.in_bounds(*next_cell) and next_cell not in body:
                    d = direction_from_to(head, next_cell)
                    if d is not None:
                        return d

        path_tail = path_to_tail(state)
        if path_tail and len(path_tail) >= 2:
            d = direction_from_to(head, path_tail[1])
            if d is not None and d != OPPOSITE[state.direction]:
                return d

        return safest_local_step(state)
