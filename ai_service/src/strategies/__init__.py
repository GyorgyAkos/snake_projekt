from .base import Strategy
from .astar import AStarStrategy
from .hamilton import HamiltonianStrategy
from .bfs import BFSStrategy
from .greedy import GreedyStrategy
from .follow_tail import FollowTailStrategy
from .hamilton_zigzag import HamiltonianZigzagStrategy
from .lookahead import LookAheadStrategy

__all__ = [
    "Strategy",
    "AStarStrategy",
    "HamiltonianStrategy",
    "BFSStrategy",
    "GreedyStrategy",
    "FollowTailStrategy",
    "HamiltonianZigzagStrategy",
    "LookAheadStrategy",
]

STRATEGIES = {
    "astar": AStarStrategy,
    "hamilton": HamiltonianStrategy,
    "bfs": BFSStrategy,
    "greedy": GreedyStrategy,
    "follow_tail": FollowTailStrategy,
    "hamilton_zigzag": HamiltonianZigzagStrategy,
    "lookahead": LookAheadStrategy,
}
