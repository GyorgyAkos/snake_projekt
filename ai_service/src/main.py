"""
Snake AI szolgáltatás – FastAPI, WebSocket (spec: AI modul Python + FastAPI, valós idejű állapot).
"""
import json
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

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
