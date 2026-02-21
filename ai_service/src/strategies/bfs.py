"""
BFS (szélességi keresés) az ételig – heurisztika nélküli legrövidebb út.
Ugyanaz a fallback mint az A*-nál: farok-követés vagy legbiztonságosabb lépés.
"""
from collections import deque

from ..state import GameState, Direction, DELTA
from .base import Strategy
from .astar import direction_from_to, path_to_tail, safest_local_step


def bfs_path(
    start: tuple[int, int],
    goal: tuple[int, int],
    obstacles: set[tuple[int, int]],
    rows: int,
    cols: int,
) -> list[tuple[int, int]] | None:
    """BFS útvonal start -> goal; akadályok: obstacles + fal."""
    if start == goal:
        return [start]
    if goal in obstacles:
        return None

    def in_bounds(x: int, y: int) -> bool:
        return 0 <= x < cols and 0 <= y < rows

    def neighbors(p: tuple[int, int]):
        x, y = p
        for dx, dy in DELTA.values():
            n = (x + dx, y + dy)
            if in_bounds(*n) and n not in obstacles:
                yield n

    came_from: dict[tuple[int, int], tuple[int, int]] = {}
    q: deque[tuple[int, int]] = deque([start])
    came_from[start] = start

    while q:
        current = q.popleft()
        if current == goal:
            path = []
            while current in came_from and came_from[current] != current:
                path.append(current)
                current = came_from[current]
            path.append(start)
            path.reverse()
            return path
        for n in neighbors(current):
            if n not in came_from:
                came_from[n] = current
                q.append(n)
    return None


class BFSStrategy(Strategy):
    """BFS az ételig (legrövidebb lépésszám); fallback: farok-követés vagy legbiztonságosabb lépés."""

    def next_move(self, state: GameState) -> Direction:
        head = state.head
        food = state.food
        body = state.body_set(exclude_tail=True)

        if not food:
            return safest_local_step(state)

        path = bfs_path(head, food, body, state.rows, state.cols)
        if path and len(path) >= 2:
            next_cell = path[1]
            if state.in_bounds(*next_cell) and next_cell not in body:
                d = direction_from_to(head, next_cell)
                if d is not None:
                    return d

        path_tail = path_to_tail(state)
        if path_tail and len(path_tail) >= 2:
            d = direction_from_to(head, path_tail[1])
            if d is not None:
                return d

        return safest_local_step(state)
