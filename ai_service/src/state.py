"""
Játékállapot reprezentáció – a frontend GameStateSnapshot formátumával kompatibilis.
Spec 7.5.3: kígyó pozíciólista (fej az elején), irány, étel pozíció, rács méret.
"""
from dataclasses import dataclass
from typing import Literal

Direction = Literal["Up", "Right", "Down", "Left"]

DIRECTIONS: tuple[Direction, ...] = ("Up", "Right", "Down", "Left")

# (dx, dy) az irányokhoz: Up, Right, Down, Left
DELTA: dict[Direction, tuple[int, int]] = {
    "Up": (0, -1),
    "Down": (0, 1),
    "Left": (-1, 0),
    "Right": (1, 0),
}

OPPOSITE: dict[Direction, Direction] = {
    "Up": "Down",
    "Down": "Up",
    "Left": "Right",
    "Right": "Left",
}


@dataclass
class GameState:
    """A frontend által küldött állapot (snake[0] = fej)."""
    snake: list[tuple[int, int]]  # [x, y] lista, fej az elején
    direction: Direction
    food: tuple[int, int] | None
    rows: int
    cols: int
    seed: int = 0
    tick: int = 0
    score: int = 0

    @property
    def head(self) -> tuple[int, int]:
        return self.snake[0]

    @property
    def tail(self) -> tuple[int, int]:
        return self.snake[-1]

    def in_bounds(self, x: int, y: int) -> bool:
        return 0 <= x < self.cols and 0 <= y < self.rows

    def body_set(self, exclude_tail: bool = False) -> set[tuple[int, int]]:
        """Kígyó test cellái (akadály az útkereséshez)."""
        if exclude_tail and len(self.snake) > 1:
            return set(self.snake[:-1])
        return set(self.snake)


def parse_state(data: dict) -> GameState:
    """WebSocket/REST JSON -> GameState."""
    snake_raw = data.get("snake", [])
    snake = [tuple(p) for p in snake_raw]
    direction = data.get("direction", "Right")
    if direction not in DIRECTIONS:
        direction = "Right"
    food_raw = data.get("food")
    food = tuple(food_raw) if food_raw and len(food_raw) == 2 else None
    return GameState(
        snake=snake,
        direction=direction,
        food=food,
        rows=int(data.get("rows", 20)),
        cols=int(data.get("cols", 20)),
        seed=int(data.get("seed", 0)),
        tick=int(data.get("tick", 0)),
        score=int(data.get("score", 0)),
    )
