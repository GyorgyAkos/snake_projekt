"""
Look-ahead N lépés (N = 3–5): szimulálja az N lépést minden lehetséges irányból
(greedy választással az alacsonyabb szinteken), és azt választja, ahol a kígyó él
és az ételhez közelebb kerül / több szabad hely marad.
"""
from ..state import GameState, Direction, DIRECTIONS, DELTA, OPPOSITE, simulate_step
from .base import Strategy
from .astar import flood_fill_count


def manhattan(a: tuple[int, int], b: tuple[int, int]) -> int:
    return abs(a[0] - b[0]) + abs(a[1] - b[1])


def evaluate(state: GameState) -> float:
    head = state.head
    body_no_tail = state.body_set(exclude_tail=True)
    count = flood_fill_count(head, body_no_tail, state.rows, state.cols)
    if state.food and state.in_bounds(*state.food):
        return count * 1.0 - manhattan(head, state.food) * 0.5
    return float(count)


def simulate_greedy_n(state: GameState, n: int) -> GameState | None:
    """
    N lépés szimulálása: minden lépésnél a legjobb (értékelés szerint) lépést választjuk.
    Vissza: állapot N lépés után, vagy None ha közben meghal.
    """
    s = state
    for _ in range(n):
        best_s: GameState | None = None
        best_val = -10.0**9
        current_d = s.direction
        for d in DIRECTIONS:
            if d == OPPOSITE[current_d]:
                continue
            s_next = simulate_step(s, d)
            if s_next is None:
                continue
            val = evaluate(s_next)
            if val > best_val:
                best_val = val
                best_s = s_next
        if best_s is None:
            return None
        s = best_s
    return s


class LookAheadNStrategy(Strategy):
    """N lépés előretekintés: szimulál N lépést minden kezdő irányból (greedy aláírányokkal), legjobb értékelésűt választja."""

    def __init__(self, n: int = 4):
        self.n = max(1, min(n, 6))

    def next_move(self, state: GameState) -> Direction:
        head = state.head
        current_d = state.direction
        best_d: Direction | None = None
        best_val = -10.0**9

        for d in DIRECTIONS:
            if d == OPPOSITE[current_d]:
                continue
            s1 = simulate_step(state, d)
            if s1 is None:
                continue
            s_final = simulate_greedy_n(s1, self.n - 1) if self.n > 1 else s1
            if s_final is None:
                val = evaluate(s1)
            else:
                val = evaluate(s_final)
            if val > best_val:
                best_val = val
                best_d = d

        if best_d is not None:
            return best_d
        return current_d
