"""
Hamilton-kör zigzag változat: soronként balra-jobbra, majd jobbra-balra (sávos kitöltés).
A kígyó a kör mentén halad, étel felé „levág” A*-val ha biztonságos.
"""
from ..state import GameState, Direction, DELTA
from .base import Strategy
from .astar import astar_path, direction_from_to, safest_local_step

_cycle_cache: dict[tuple[int, int], list[tuple[int, int]]] = {}


def _build_zigzag_cycle(rows: int, cols: int) -> list[tuple[int, int]]:
    """Zigzag: 0. sor bal->jobbra, 1. sor jobbra->balra, stb."""
    out: list[tuple[int, int]] = []
    for r in range(rows):
        if r % 2 == 0:
            for c in range(cols):
                out.append((c, r))
        else:
            for c in range(cols - 1, -1, -1):
                out.append((c, r))
    return out


def get_zigzag_cycle(rows: int, cols: int) -> list[tuple[int, int]]:
    key = (rows, cols)
    if key not in _cycle_cache:
        _cycle_cache[key] = _build_zigzag_cycle(rows, cols)
    return _cycle_cache[key]


def next_on_cycle(cycle: list[tuple[int, int]], cell: tuple[int, int]) -> tuple[int, int] | None:
    try:
        i = cycle.index(cell)
    except ValueError:
        return None
    return cycle[(i + 1) % len(cycle)]


class HamiltonianZigzagStrategy(Strategy):
    """Hamilton zigzag kör; étel felé A* levágás ha biztonságos."""

    def next_move(self, state: GameState) -> Direction:
        head = state.head
        food = state.food
        body_no_tail = state.body_set(exclude_tail=True)
        rows, cols = state.rows, state.cols
        cycle = get_zigzag_cycle(rows, cols)
        next_cell = next_on_cycle(cycle, head)
        if not next_cell:
            return safest_local_step(state)
        if food and state.in_bounds(*food):
            path = astar_path(head, food, body_no_tail, rows, cols)
            if path and len(path) >= 2:
                to_cell = path[1]
                if to_cell not in body_no_tail and state.in_bounds(*to_cell):
                    d = direction_from_to(head, to_cell)
                    if d is not None:
                        return d
        d = direction_from_to(head, next_cell)
        if d is not None:
            return d
        return safest_local_step(state)
