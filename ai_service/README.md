# Snake AI Service

A specifikáció (7.5.2, 7.6.1) szerinti Python AI modul: **FastAPI**, **WebSocket** a valós idejű játékállapothoz, és **A\*** heurisztikus stratégia biztonsági fallbackkal.

## Követelmények

- Python 3.10+
- `requirements.txt`: fastapi, uvicorn

## Telepítés

```bash
cd ai_service
pip install -r requirements.txt
```

## Futtatás

Először telepítsd a függőségeket (ha még nem tetted):

```bash
cd ai_service
pip install -r requirements.txt
```

Indítás (a `python -m` formátum mindig működik, ha a csomag telepítve van):

```bash
cd ai_service
python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

Ha a `uvicorn` parancs közvetlenül is ismert (pl. a pip Scripts mappa a PATH-on van):

```bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

A szolgáltatás a **8000** porton fut.

## API

### REST

- **GET /health** – egészség ellenőrzés: `{"status": "ok", "service": "snake-ai"}`
- **GET /strategies** – elérhető stratégiák: `{"strategies": ["astar"], "default": "astar"}`
- **POST /next** – egy állapothoz egy lépés (teszteléshez). Body (JSON): a frontend `GameStateSnapshot` mezői (`snake`, `direction`, `food`, `rows`, `cols`, stb.). Válasz: `{"action": "Up"|"Right"|"Down"|"Left"}`.

### WebSocket: /ws

A kliens JSON üzeneteket küld: a játék aktuális állapota (ugyanaz a struktúra, mint a POST /next body). A szerver válasza: `{"action": "Up"|"Right"|"Down"|"Left"}`.

Példa állapot (frontend kompatibilis):

```json
{
  "snake": [[10, 10], [9, 10], [8, 10]],
  "direction": "Right",
  "food": [15, 10],
  "rows": 20,
  "cols": 20,
  "seed": 42,
  "tick": 0,
  "score": 0
}
```

## Stratégiák

- **astar** (alapértelmezett): A\* az ételig Manhattan-heurisztikával; ha nincs biztonságos útvonal, legbiztonságosabb lokális lépés (flood fill szabadságfok) vagy farok-követés (spec 7.6.1).

Környezeti változók (opcionális):

- `AI_STRATEGY` – stratégia neve (jelenleg csak `astar`)
- `AI_SAFETY` – `true` (alap) / `false` – biztonsági fallback használata

## Struktúra

- `src/main.py` – FastAPI app, WebSocket, REST /health, /strategies, POST /next
- `src/state.py` – `GameState`, `parse_state()`, irányok (Up/Right/Down/Left)
- `src/strategies/base.py` – `Strategy` absztrakt interfész: `next_move(state) -> Direction`
- `src/strategies/astar.py` – A\* útvonal, flood fill fallback, farok-követés
