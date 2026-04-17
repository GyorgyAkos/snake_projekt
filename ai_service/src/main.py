"""
Snake AI szolgáltatás – FastAPI, WebSocket (spec: AI modul Python + FastAPI, valós idejű állapot).
"""
import json
import os
import re
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from .state import parse_state, GameState
from .strategies import STRATEGIES, AStarStrategy


def get_strategy(name: str = "astar", safety: bool = True):
    if name in STRATEGIES:
        if name == "astar":
            return AStarStrategy(safety=safety)
        return STRATEGIES[name]()
    return AStarStrategy(safety=safety)


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    # shutdown: nothing to clean up


app = FastAPI(
    title="Snake AI Service",
    description="WebSocket: játékállapot -> következő lépés (Up/Right/Down/Left). Spec 7.5.2, 7.6.1.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Benchmark eredmények: repo gyökeréhez képest benchmarks/results (fejlesztői gépen)
_SERVICE_ROOT = Path(__file__).resolve().parent
_PROJECT_ROOT = _SERVICE_ROOT.parents[1]
_BENCHMARK_RESULTS = _PROJECT_ROOT / "benchmarks" / "results"
_BENCHMARK_PLOTS = _BENCHMARK_RESULTS / "plots"
_STRATEGY_JSON_RE = re.compile(r"^strategy_benchmark_(?!summary$)([a-z0-9_]+)\.json$")
_SAFE_PLOT_NAME = re.compile(r"^[a-zA-Z0-9_-]+\.png$")


def _load_strategy_summary(path: Path) -> dict:
    with path.open(encoding="utf-8") as f:
        data = json.load(f)
    if isinstance(data, dict) and "summary" in data and isinstance(data["summary"], dict):
        return data["summary"]
    if isinstance(data, dict) and "strategy" in data:
        return data
    raise ValueError("unexpected benchmark json shape")


@app.get("/benchmark/summaries")
def benchmark_summaries():
    """
    Összes strategy_benchmark_*.json fájl összefoglalója (kivéve strategy_benchmark_summary.json).
    A frontend statisztika oldal ezt használja táblázathoz / összehasonlításhoz.
    """
    if not _BENCHMARK_RESULTS.is_dir():
        return {"summaries": [], "benchmark_dir": str(_BENCHMARK_RESULTS), "error": "benchmark directory not found"}
    out: list[dict] = []
    for p in sorted(_BENCHMARK_RESULTS.glob("strategy_benchmark_*.json")):
        m = _STRATEGY_JSON_RE.match(p.name)
        if not m:
            continue
        try:
            out.append(_load_strategy_summary(p))
        except (OSError, ValueError, json.JSONDecodeError):
            continue
    out.sort(key=lambda s: (-float(s.get("score_mean") or 0), str(s.get("strategy") or "")))
    return {"summaries": out, "benchmark_dir": str(_BENCHMARK_RESULTS)}


@app.get("/benchmark/plots/{filename}")
def benchmark_plot(filename: str):
    if not _SAFE_PLOT_NAME.match(filename):
        raise HTTPException(status_code=400, detail="invalid plot name")
    path = _BENCHMARK_PLOTS / filename
    if not path.is_file():
        raise HTTPException(status_code=404, detail="plot not found")
    return FileResponse(path, media_type="image/png")


@app.get("/health")
def health():
    return {"status": "ok", "service": "snake-ai"}


@app.get("/strategies")
def list_strategies():
    return {"strategies": list(STRATEGIES.keys()), "default": "astar"}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    strategy_name = os.environ.get("AI_STRATEGY", "astar")
    safety = os.environ.get("AI_SAFETY", "true").lower() == "true"
    strategy = get_strategy(name=strategy_name, safety=safety)
    try:
        while True:
            raw = await websocket.receive_text()
            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                await websocket.send_json({"error": "invalid json"})
                continue
            name = (data.get("strategy") or strategy_name).lower()
            if name in STRATEGIES:
                strategy = get_strategy(name=name, safety=safety)
            try:
                state = parse_state(data)
            except (TypeError, KeyError, ValueError) as e:
                await websocket.send_json({"error": f"invalid state: {e}"})
                continue
            if not state.snake or not state.in_bounds(*state.head):
                await websocket.send_json({"error": "invalid snake"})
                continue
            action = strategy.next_move(state)
            await websocket.send_json({"action": action})
    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await websocket.send_json({"error": str(e)})
        except Exception:
            pass


@app.post("/next")
def next_action_endpoint(data: dict):
    """REST alternatíva: egy állapothoz egy lépés (teszteléshez). strategy: astar | hamilton."""
    try:
        state = parse_state(data)
    except (TypeError, KeyError, ValueError) as e:
        return {"error": f"invalid state: {e}"}
    if not state.snake or not state.in_bounds(*state.head):
        return {"error": "invalid snake"}
    name = (data.get("strategy") or os.environ.get("AI_STRATEGY", "astar")).lower()
    strategy = get_strategy(name=name if name in STRATEGIES else "astar")
    action = strategy.next_move(state)
    return {"action": action}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
