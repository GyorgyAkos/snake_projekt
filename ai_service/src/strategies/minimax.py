"""
Minimax rövid horizonttal (1–2 lépés): minden lehetséges első lépést kipróbál,
minden második lépést is; értékeli a végső állapotot (étel közel, szabad hely),
és a maximin szerint választ (legjobb első lépés a legrosszabb második lépés ellenére).
"""
from ..state import GameState, Direction, DIRECTIONS, DELTA, OPPOSITE, simulate_step
from .base import Strategy
from .astar import flood_fill_count, direction_from_to


def manhattan(a: tuple[int, int], b: tuple[int, int]) -> int:
    return abs(a[0] - b[0]) + abs(a[1] - b[1])


def evaluate(state: GameState) -> float:
    """
    Magasabb = jobb: sok szabad cella, étel közel.
    Ha nincs étel, csak flood fill számít.
    """
    head = state.head
    body_no_tail = state.body_set(exclude_tail=True)
    count = flood_fill_count(head, body_no_tail, state.rows, state.cols)
    if state.food and state.in_bounds(*state.food):
        dist = manhattan(head, state.food)
        return count * 1.0 - dist * 0.5
    return float(count)


class MinimaxStrategy(Strategy):
    """1–2 lépés előre: értékeli az állapotot (szabadságfok, étel távolság), maximin választás."""

    def __init__(self, depth: int = 2):
        self.depth = max(1, min(depth, 2))

    def next_move(self, state: GameState) -> Direction:
        head = state.head
        current_d = state.direction
        best_first: Direction | None = None
        best_value = -10.0**9

        for d1 in DIRECTIONS:
            if d1 == OPPOSITE[current_d]:
                continue
            s1 = simulate_step(state, d1)
            if s1 is None:
                continue
            if self.depth == 1:
                val = evaluate(s1)
            else:
                val = 10.0**9
                for d2 in DIRECTIONS:
                    if d2 == OPPOSITE[d1]:
                        continue
                    s2 = simulate_step(s1, d2)
                    if s2 is None:
                        val = min(val, -1000.0)
                        continue
                    val = min(val, evaluate(s2))
                if val == 10.0**9:
                    val = evaluate(s1)
            if val > best_value:
                best_value = val
                best_first = d1

        if best_first is not None:
            return best_first
        return current_d
