"""
Gym-szerű Snake környezet: reset, step, observation (jellemző alapú), reward.
A state.py GameState és simulate_step használatával.
"""
import random
from typing import Any

from ..state import GameState, Direction, simulate_step, DELTA, DIRECTIONS

# Akció: 0=Up, 1=Right, 2=Down, 3=Left
ACTION_NAMES: list[Direction] = ["Up", "Right", "Down", "Left"]
ACTION_TO_DIR = {i: d for i, d in enumerate(ACTION_NAMES)}
DIR_TO_ACTION = {d: i for i, d in enumerate(ACTION_NAMES)}
def opposite_action_index(action_index: int) -> int:
    """Ellentétes irány indexe (180°), tanításnál tiltáshoz."""
    return (action_index + 2) % 4

OBSERVATION_DIM = 12


def state_to_observation(state: GameState) -> list[float]:
    """
    Jellemző alapú megfigyelés: 12 float.
    [0-3] veszély (1.0 ha fal vagy test 1-2 lépésen belül) Up, Right, Down, Left.
    [4-7] fal távolság (lépések) / max(rows,cols) mind a 4 irányban.
    [8,9] étel relatív: (food.x - head.x)/cols, (food.y - head.y)/rows; nincs étel -> 0, 0.
    [10] étel Manhattan távolság / (rows+cols); nincs étel -> 1.0.
    [11] kígyó hossz / (rows*cols).
    """
    rows, cols = state.rows, state.cols
    head = state.head
    body = state.body_set(exclude_tail=False)
    food = state.food
    max_rc = max(rows, cols, 1)

    obs: list[float] = []

    # Veszély 4 irányban (Up, Right, Down, Left): 1.0 ha fal vagy test 2 lépésen belül
    for d in ACTION_NAMES:
        dx, dy = DELTA[d]
        danger = 0.0
        for step in range(1, 3):
            nx, ny = head[0] + dx * step, head[1] + dy * step
            if not (0 <= nx < cols and 0 <= ny < rows) or (nx, ny) in body:
                danger = 1.0
                break
        obs.append(danger)

    # Fal távolság normalizálva (lépések a falig)
    for d in ACTION_NAMES:
        dx, dy = DELTA[d]
        dist = 0
        if dx != 0:
            dist = (cols - 1 - head[0]) if dx > 0 else head[0]
        else:
            dist = (rows - 1 - head[1]) if dy > 0 else head[1]
        obs.append(min(dist, max_rc) / max_rc)

    # Étel relatív pozíció és távolság
    if food is not None:
        obs.append((food[0] - head[0]) / max(cols, 1))
        obs.append((food[1] - head[1]) / max(rows, 1))
        manhattan = abs(food[0] - head[0]) + abs(food[1] - head[1])
        obs.append(manhattan / (rows + cols))
    else:
        obs.extend([0.0, 0.0, 1.0])

    # Kígyó hossz normalizálva
    obs.append(len(state.snake) / (rows * cols))

    assert len(obs) == OBSERVATION_DIM
    return obs


def _random_empty_cell(rows: int, cols: int, occupied: set[tuple[int, int]], rng: random.Random) -> tuple[int, int] | None:
    cand = [(x, y) for x in range(cols) for y in range(rows) if (x, y) not in occupied]
    if not cand:
        return None
    return rng.choice(cand)


class SnakeEnv:
    """
    Gym-szerű környezet: reset(seed=None), step(action) -> (obs, reward, done, info).
    Akció: 0=Up, 1=Right, 2=Down, 3=Left.
    """

    def __init__(self, rows: int = 20, cols: int = 20, reward_food: float = 1.0, reward_death: float = -10.0,
                 reward_step_toward: float = 0.03, reward_step_away: float = -0.03,
                 reward_survival: float = 0.02, reward_starvation: float = -0.5,
                 max_steps_per_episode: int | None = None):
        self.rows = rows
        self.cols = cols
        self.reward_food = reward_food
        self.reward_death = reward_death
        self.reward_step_toward = reward_step_toward
        self.reward_step_away = reward_step_away
        self.reward_survival = reward_survival
        self.reward_starvation = reward_starvation
        self.max_steps_per_episode = max_steps_per_episode
        self._state: GameState | None = None
        self._rng: random.Random = random.Random()
        self._step_count = 0

    def current_direction_index(self) -> int:
        """Aktuális irány indexe (0–3). Reset előtt 0."""
        if self._state is None:
            return 0
        return DIR_TO_ACTION.get(self._state.direction, 0)

    @property
    def observation_space(self) -> dict[str, Any]:
        return {"shape": (OBSERVATION_DIM,), "dtype": "float32"}

    @property
    def action_space(self) -> dict[str, Any]:
        return {"n": 4, "names": list(ACTION_NAMES)}

    def reset(self, seed: int | None = None) -> tuple[list[float], dict]:
        if seed is not None:
            self._rng = random.Random(seed)
        # Kezdő kígyó: középen 3 cella, irány Jobbra
        cx, cy = self.cols // 2, self.rows // 2
        snake = [(cx - 1, cy), (cx - 2, cy), (cx - 3, cy)]
        if cx - 3 < 0:
            snake = [(cx + 1, cy), (cx + 2, cy), (cx + 3, cy)]
            snake.reverse()
        occupied = set(snake)
        food = _random_empty_cell(self.rows, self.cols, occupied, self._rng)
        if food is None:
            food = (cx, cy - 1) if (cx, cy - 1) not in occupied else (cx + 1, cy)
        self._state = GameState(
            snake=snake,
            direction="Right",
            food=food,
            rows=self.rows,
            cols=self.cols,
            seed=seed or 0,
            tick=0,
            score=0,
        )
        self._step_count = 0
        obs = state_to_observation(self._state)
        return obs, {"score": 0, "tick": 0}

    def step(self, action: int) -> tuple[list[float], float, bool, dict]:
        if self._state is None:
            raise RuntimeError("Call reset() first")
        direction = ACTION_TO_DIR.get(action, "Right")
        head = self._state.head
        food = self._state.food
        prev_dist = 0.0
        if food is not None:
            prev_dist = abs(food[0] - head[0]) + abs(food[1] - head[1])

        raw_new = simulate_step(self._state, direction)
        if raw_new is None:
            obs = state_to_observation(self._state)
            return obs, self.reward_death, True, {"score": self._state.score, "tick": self._state.tick, "done_reason": "death"}

        ate = raw_new.food is None and food is not None
        reward = self.reward_food if ate else 0.0
        reward += self.reward_survival

        if raw_new.food is None:
            occupied = set(raw_new.snake)
            new_food = _random_empty_cell(self.rows, self.cols, occupied, self._rng)
            if new_food is not None:
                new_state = GameState(
                    snake=raw_new.snake,
                    direction=raw_new.direction,
                    food=new_food,
                    rows=raw_new.rows,
                    cols=raw_new.cols,
                    seed=raw_new.seed,
                    tick=raw_new.tick,
                    score=raw_new.score,
                )
            else:
                new_state = raw_new
        else:
            new_state = raw_new
            if reward == 0.0 and food is not None:
                new_dist = abs(food[0] - new_state.head[0]) + abs(food[1] - new_state.head[1])
                if new_dist < prev_dist:
                    reward = self.reward_step_toward
                elif new_dist > prev_dist:
                    reward = self.reward_step_away

        self._state = new_state
        self._step_count += 1
        obs = state_to_observation(self._state)
        done = False
        if self.max_steps_per_episode is not None and self._step_count >= self.max_steps_per_episode:
            done = True
            reward += self.reward_starvation
        info = {"score": new_state.score, "tick": new_state.tick}
        return obs, reward, done, info


if __name__ == "__main__":
    env = SnakeEnv(rows=12, cols=12)
    obs, info = env.reset(seed=42)
    assert len(obs) == OBSERVATION_DIM
    for _ in range(100):
        action = random.randint(0, 3)
        obs, reward, done, info = env.step(action)
        assert len(obs) == OBSERVATION_DIM
        if done:
            assert reward == env.reward_death
            break
    obs, info = env.reset(seed=123)
    print("env ok: 100 steps or done, reset ok")
