"""
Egy lépéses előretekintés: minden lehetséges irányt kipróbál,
és azt választja, ahol a legtöbb szabad cella érhető (flood fill),
illetve ha egyenlő, az ételhez közelebb kerül.
"""
from ..state import GameState, Direction, DIRECTIONS, DELTA, OPPOSITE
from .base import Strategy
from .astar import flood_fill_count


def manhattan_dist(a: tuple[int, int], b: tuple[int, int]) -> int:
    return abs(a[0] - b[0]) + abs(a[1] - b[1])


class LookAheadStrategy(Strategy):
    """1 lépés előre: max flood fill szabadság, döntetlenben étel felé közelebb."""

    def next_move(self, state: GameState) -> Direction:
        head = state.head
        food = state.food
        body_no_tail = state.body_set(exclude_tail=True)
        current_d = state.direction
        best_d: Direction | None = None
        best_count = -1
        best_dist = 10**9

        for d in DIRECTIONS:
            if d == OPPOSITE[current_d]:
                continue
            dx, dy = DELTA[d]
            nx, ny = head[0] + dx, head[1] + dy
            if not state.in_bounds(nx, ny):
                continue
            if (nx, ny) in body_no_tail:
                continue
            count = flood_fill_count((nx, ny), body_no_tail, state.rows, state.cols)
            dist = manhattan_dist((nx, ny), food) if food else 0
            if count > best_count or (count == best_count and dist < best_dist):
                best_count = count
                best_dist = dist
                best_d = d

        if best_d is not None:
            return best_d
        return current_d
