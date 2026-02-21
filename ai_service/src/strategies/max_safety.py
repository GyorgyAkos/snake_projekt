"""
Önálló „safety check” / maximal safety stratégia: minden lépésnél azt választja,
ahol a legtöbb szabad cella van (flood fill), és csak olyan lépést tesz, ami után
még van út a fej és a farok között (BFS/flood fill). Ha nincs ilyen, legbiztonságosabb lépés.
"""
from ..state import GameState, Direction, DIRECTIONS, DELTA, OPPOSITE, simulate_step
from .base import Strategy
from .astar import flood_fill_count, path_to_tail, direction_from_to, safest_local_step


def has_path_head_to_tail(state: GameState) -> bool:
    """Van-e út a fej és a farok között (a test többi része akadály)."""
    return path_to_tail(state) is not None


class MaxSafetyStrategy(Strategy):
    """
    Maximal safety: csak olyan lépés, ami után még van út fej–farok között;
    köztük a legnagyobb flood fill szabadságú.
    """

    def next_move(self, state: GameState) -> Direction:
        head = state.head
        body_no_tail = state.body_set(exclude_tail=True)
        current_d = state.direction
        best_d: Direction | None = None
        best_count = -1

        for d in DIRECTIONS:
            if d == OPPOSITE[current_d]:
                continue
            dx, dy = DELTA[d]
            nx, ny = head[0] + dx, head[1] + dy
            if not state.in_bounds(nx, ny):
                continue
            if (nx, ny) in body_no_tail:
                continue
            next_state = simulate_step(state, d)
            if next_state is None:
                continue
            if not has_path_head_to_tail(next_state):
                continue
            count = flood_fill_count((nx, ny), body_no_tail, state.rows, state.cols)
            if count > best_count:
                best_count = count
                best_d = d

        if best_d is not None:
            return best_d
        return safest_local_step(state)
