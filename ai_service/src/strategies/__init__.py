from .base import Strategy
from .astar import AStarStrategy

__all__ = ["Strategy", "AStarStrategy"]

STRATEGIES = {
    "astar": AStarStrategy,
}
