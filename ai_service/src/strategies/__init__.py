from .base import Strategy
from .astar import AStarStrategy
from .hamilton import HamiltonianStrategy

__all__ = ["Strategy", "AStarStrategy", "HamiltonianStrategy"]

STRATEGIES = {
    "astar": AStarStrategy,
    "hamilton": HamiltonianStrategy,
}
