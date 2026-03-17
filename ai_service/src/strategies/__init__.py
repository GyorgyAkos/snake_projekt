from .base import Strategy
from .astar import AStarStrategy
from .hamilton import HamiltonianStrategy
from .bfs import BFSStrategy
from .greedy import GreedyStrategy
from .follow_tail import FollowTailStrategy
from .hamilton_zigzag import HamiltonianZigzagStrategy
from .lookahead import LookAheadStrategy
from .minimax import MinimaxStrategy
from .max_safety import MaxSafetyStrategy
from .lookahead_n import LookAheadNStrategy
from .hamilton_short_cycles import HamiltonShortCyclesStrategy
from .dqn import DQNStrategy
from .ppo import PPOStrategy
from .neat_strategy import NEATStrategy

__all__ = [
    "Strategy",
    "AStarStrategy",
    "HamiltonianStrategy",
    "BFSStrategy",
    "GreedyStrategy",
    "FollowTailStrategy",
    "HamiltonianZigzagStrategy",
    "LookAheadStrategy",
    "MinimaxStrategy",
    "MaxSafetyStrategy",
    "LookAheadNStrategy",
    "HamiltonShortCyclesStrategy",
    "DQNStrategy",
    "PPOStrategy",
    "NEATStrategy",
]

STRATEGIES = {
    "astar": AStarStrategy,
    "hamilton": HamiltonianStrategy,
    "bfs": BFSStrategy,
    "greedy": GreedyStrategy,
    "follow_tail": FollowTailStrategy,
    "hamilton_zigzag": HamiltonianZigzagStrategy,
    "lookahead": LookAheadStrategy,
    "minimax": lambda: MinimaxStrategy(depth=2),
    "max_safety": MaxSafetyStrategy,
    "lookahead_3": lambda: LookAheadNStrategy(n=3),
    "lookahead_5": lambda: LookAheadNStrategy(n=5),
    "hamilton_short_cycles": HamiltonShortCyclesStrategy,
    "dqn": DQNStrategy,
    "ppo": PPOStrategy,
    "neuroevolution": NEATStrategy,
}
