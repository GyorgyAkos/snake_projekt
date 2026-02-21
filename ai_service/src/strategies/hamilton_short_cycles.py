"""
Hamilton „rövid ciklusok”: a pályát 2x2 blokkokra bontjuk, minden blokkban egy 4 cellás kör.
A kígyó egy blokk körén belül halad; étel felé a szomszédos blokk felé vált.
"""
from ..state import GameState, Direction, DELTA, OPPOSITE
from .base import Strategy
from .astar import astar_path, direction_from_to, safest_local_step


def block_cycle_cells(bx: int, by: int) -> list[tuple[int, int]]:
    """Egy 2x2 blokk cellái ciklus sorrendben: bal-felső, jobb-felső, jobb-alsó, bal-alsó."""
    return [
        (bx * 2, by * 2),
        (bx * 2 + 1, by * 2),
        (bx * 2 + 1, by * 2 + 1),
        (bx * 2, by * 2 + 1),
    ]


def cell_to_block(x: int, y: int) -> tuple[int, int]:
    """Cella -> blokk index (bx, by)."""
    return (x // 2, y // 2)


def next_in_block_cycle(head: tuple[int, int], cols: int, rows: int) -> tuple[int, int] | None:
    """Következő cella a blokk ciklusában; ha a blokk a szélen van, a ciklus le lehet rövidebb."""
    bx, by = cell_to_block(head[0], head[1])
    cells = block_cycle_cells(bx, by)
    # Csak a pályán belüli cellákat tartjuk
    valid = [c for c in cells if 0 <= c[0] < cols and 0 <= c[1] < rows]
    if not valid or head not in valid:
        return None
    i = valid.index(head)
    next_i = (i + 1) % len(valid)
    return valid[next_i]


class HamiltonShortCyclesStrategy(Strategy):
    """
    Több kis (2x2) kör a pályán; a kígyó a blokk ciklusát követi,
    étel felé a szomszédos blokk irányába vált (A*), ha biztonságos.
    """

    def next_move(self, state: GameState) -> Direction:
        head = state.head
        food = state.food
        body_no_tail = state.body_set(exclude_tail=True)
        rows, cols = state.rows, state.cols
        current_d = state.direction

        if food and state.in_bounds(*food):
            path = astar_path(head, food, body_no_tail, rows, cols)
            if path and len(path) >= 2:
                to_cell = path[1]
                if to_cell not in body_no_tail and state.in_bounds(*to_cell):
                    d = direction_from_to(head, to_cell)
                    if d is not None and d != OPPOSITE[current_d]:
                        return d

        next_cell = next_in_block_cycle(head, cols, rows)
        if next_cell and next_cell not in body_no_tail and state.in_bounds(*next_cell):
            d = direction_from_to(head, next_cell)
            if d is not None and d != OPPOSITE[current_d]:
                return d

        return safest_local_step(state)
