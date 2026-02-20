"""
Hamilton-kör alapú stratégia (spec 7.6.2): előre generált kör a rácson,
a kígyó a kör mentén halad, az ételt „levágásokkal” gyorsítja.
"""
from ..state import GameState, Direction, DELTA
from .base import Strategy
from .astar import astar_path, direction_from_to

# Cache: (rows, cols) -> list of (x, y) in cycle order
_cycle_cache: dict[tuple[int, int], list[tuple[int, int]]] = {}


def _build_spiral_cycle(rows: int, cols: int) -> list[tuple[int, int]]:
    """Spirál (külső perem befelé) – minden cella pont egyszer; zárt út ha a rács cellaszáma páros."""
    out: list[tuple[int, int]] = []
    r0, r1 = 0, rows - 1
    c0, c1 = 0, cols - 1
    while r0 <= r1 and c0 <= c1:
        # felső sor: (c0, r0) -> (c1, r0)
        for c in range(c0, c1 + 1):
            out.append((c, r0))
        r0 += 1
        if r0 > r1:
            break
        # jobb oszlop: (c1, r0) -> (c1, r1)
        for r in range(r0, r1 + 1):
            out.append((c1, r))
        c1 -= 1
        if c0 > c1:
            break
        # alsó sor: (c1, r1) -> (c0, r1)
        for c in range(c1, c0 - 1, -1):
            out.append((c, r1))
        r1 -= 1
        if r0 > r1:
            break
        # bal oszlop: (c0, r1) -> (c0, r0)
        for r in range(r1, r0 - 1, -1):
            out.append((c0, r))
        c0 += 1
    return out


def get_hamilton_cycle(rows: int, cols: int) -> list[tuple[int, int]]:
    """Hamilton-kör (spirál) – cache-elt. rows*cols páros kell a zárt ciklushoz."""
    key = (rows, cols)
    if key not in _cycle_cache:
        _cycle_cache[key] = _build_spiral_cycle(rows, cols)
    return _cycle_cache[key]


def next_on_cycle(cycle: list[tuple[int, int]], cell: tuple[int, int]) -> tuple[int, int] | None:
    """Következő cella a cikluson; ha cell az utolsó, az első következik (kör)."""
    if not cycle:
        return None
    try:
        i = cycle.index(cell)
    except ValueError:
        return None
    next_i = (i + 1) % len(cycle)
    return cycle[next_i]


class HamiltonianStrategy(Strategy):
    """A kígyó a Hamilton-kör mentén halad; ha biztonságos, étel felé „levág” (A*)."""

    def next_move(self, state: GameState) -> Direction:
        head = state.head
        food = state.food
        body_no_tail = state.body_set(exclude_tail=True)
        rows, cols = state.rows, state.cols
        cycle = get_hamilton_cycle(rows, cols)
        if len(cycle) != rows * cols:
            # páratlan rács: spirál nem zárt; fallback: kövessük a spirált
            pass
        next_cell = next_on_cycle(cycle, head)
        if not next_cell:
            # head nincs a cikluson (nem kellene előforduljon)
            from .astar import safest_local_step
            return safest_local_step(state)
        # Ha van étel és biztonságos odamenni, A* az ételig („levágás”)
        if food and state.in_bounds(*food):
            path = astar_path(head, food, body_no_tail, rows, cols)
            if path and len(path) >= 2:
                to_cell = path[1]
                if to_cell not in body_no_tail and state.in_bounds(*to_cell):
                    d = direction_from_to(head, to_cell)
                    if d is not None:
                        return d
        # Egyébként a Hamilton-kör következő cellája
        d = direction_from_to(head, next_cell)
        if d is not None:
            return d
        from .astar import safest_local_step
        return safest_local_step(state)
