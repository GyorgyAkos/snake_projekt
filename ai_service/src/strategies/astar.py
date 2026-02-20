"""
A* útkeresés az ételig, Manhattan-heurisztikával; biztonsági fallback (spec 7.6.1).
Ha van biztonságos útvonal az ételig, azt követjük; különben legbiztonságosabb lokális lépés
(flood fill szabadságfok) vagy farok-követés.
"""
import heapq
from collections import deque

from ..state import GameState, Direction, DIRECTIONS, DELTA, OPPOSITE
from .base import Strategy


def manhattan(a: tuple[int, int], b: tuple[int, int]) -> int:
    return abs(a[0] - b[0]) + abs(a[1] - b[1])


def direction_from_to(fr: tuple[int, int], to: tuple[int, int]) -> Direction | None:
    dx = to[0] - fr[0]
    dy = to[1] - fr[1]
    if dx == 0 and dy == -1:
        return "Up"
    if dx == 0 and dy == 1:
        return "Down"
    if dx == -1 and dy == 0:
        return "Left"
    if dx == 1 and dy == 0:
        return "Right"
    return None


def astar_path(
    start: tuple[int, int],
    goal: tuple[int, int],
    obstacles: set[tuple[int, int]],
    rows: int,
    cols: int,
) -> list[tuple[int, int]] | None:
    """A* útvonal start -> goal; akadályok: obstacles + fal. Vissza: [start, ..., goal] vagy None."""
    if start == goal:
        return [start]
    if goal in obstacles:
        return None

    def in_bounds(x: int, y: int) -> bool:
        return 0 <= x < cols and 0 <= y < rows

    def neighbors(p: tuple[int, int]):
        x, y = p
        for d in ("Up", "Down", "Left", "Right"):
            dx, dy = DELTA[d]
            n = (x + dx, y + dy)
            if in_bounds(*n) and n not in obstacles:
                yield n

    # (f, g, pos); f = g + h
    h0 = manhattan(start, goal)
    open_set: list[tuple[int, int, tuple[int, int]]] = [(h0, 0, start)]
    came_from: dict[tuple[int, int], tuple[int, int]] = {}
    g_score: dict[tuple[int, int], int] = {start: 0}

    while open_set:
        _, g, current = heapq.heappop(open_set)
        if current == goal:
            path = []
            while current in came_from:
                path.append(current)
                current = came_from[current]
            path.append(start)
            path.reverse()
            return path
        for n in neighbors(current):
            tent_g = g + 1
            if n not in g_score or tent_g < g_score[n]:
                came_from[n] = current
                g_score[n] = tent_g
                h = manhattan(n, goal)
                heapq.heappush(open_set, (tent_g + h, tent_g, n))

    return None


def flood_fill_count(
    start: tuple[int, int],
    obstacles: set[tuple[int, int]],
    rows: int,
    cols: int,
) -> int:
    """Elérhető üres cellák száma start-ból (spec 7.16: flood fill szabadságfok)."""
    if start in obstacles:
        return 0

    def in_bounds(x: int, y: int) -> bool:
        return 0 <= x < cols and 0 <= y < rows

    visited: set[tuple[int, int]] = set()
    q: deque[tuple[int, int]] = deque([start])
    visited.add(start)
    while q:
        x, y = q.popleft()
        for dx, dy in DELTA.values():
            n = (x + dx, y + dy)
            if in_bounds(*n) and n not in obstacles and n not in visited:
                visited.add(n)
                q.append(n)
    return len(visited)


def safest_local_step(state: GameState) -> Direction:
    """Legbiztonságosabb lokális lépés: max flood fill szabadság (spec 7.6.1 fallback)."""
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
        count = flood_fill_count((nx, ny), body_no_tail, state.rows, state.cols)
        if count > best_count:
            best_count = count
            best_d = d

    if best_d is not None:
        return best_d
    return current_d


def path_to_tail(state: GameState) -> list[tuple[int, int]] | None:
    """Útvonal a fej és a farok között (farok-követés). A test többi része akadály."""
    head = state.head
    tail = state.tail
    body_without_tail = set(state.snake[:-1])
    return astar_path(head, tail, body_without_tail, state.rows, state.cols)


class AStarStrategy(Strategy):
    """A* az ételig; ha nincs biztonságos útvonal, legbiztonságosabb lépés vagy farok-követés."""

    def __init__(self, safety: bool = True):
        self.safety = safety

    def next_move(self, state: GameState) -> Direction:
        head = state.head
        food = state.food
        body = state.body_set(exclude_tail=True)

        if not food:
            return safest_local_step(state)

        path = astar_path(
            head, food, body, state.rows, state.cols
        )
        if path and len(path) >= 2:
            next_cell = path[1]
            if state.in_bounds(*next_cell) and next_cell not in body:
                if self.safety:
                    # Opcionális: hosszabb útvonal esetén is ellenőrizhetjük, hogy
                    # a teljes út után nem ütközünk-e. Itt csak az első lépést nézzük.
                    pass
                d = direction_from_to(head, next_cell)
                if d is not None:
                    return d

        path_tail = path_to_tail(state)
        if path_tail and len(path_tail) >= 2:
            d = direction_from_to(head, path_tail[1])
            if d is not None and d != OPPOSITE[state.direction]:
                return d

        return safest_local_step(state)
