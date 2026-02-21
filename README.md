# Snake + MI szakdolgozat

Monorepo: Snake játék frontend (React), backend (Node/Express), és Python AI szolgáltatás (A* / Hamilton stratégiák).

## Követelmények

- **Node.js** (LTS) és **npm** – frontend és backend
- **Python 3.10+** és **pip** – ai_service (MI modul)

## Projekt felépítése

| Mappa        | Tartalom                          |
|-------------|------------------------------------|
| `frontend/` | React + Vite + TypeScript, játék UI |
| `backend/`  | Express + SQLite, auth, pontszámok |
| `ai_service/` | FastAPI + WebSocket, A* / Hamilton |
| `benchmarks/`  | Benchmark script, eredmények      |
| `docs/`     | Specifikáció, szakdolgozat dokumentáció |

## Telepítés

Egyszer, minden alkomponens függősége:

```bash
# Gyökér (concurrently a dev:all-hoz)
npm install

# Frontend
npm run dev --prefix frontend
# vagy: cd frontend && npm install (ha még nem futott)

# Backend (a gyökérből)
npm run dev:backend
# vagy: cd backend && npm install && npm run dev

# AI szolgáltatás – Python függőségek
cd ai_service
pip install -r requirements.txt
cd ..
```

A gyökérbeli `npm install` telepíti a `concurrently`-t; a `frontend` és `backend` prefix-szel futtatott parancsok a saját mappájukban használják a függőségeket (ha hiányoznak, előbb: `cd frontend && npm install`, ill. `cd backend && npm install`).

## Futtatás

### Egyszerre mind a három szolgáltatás (egy parancs)

A projekt gyökeréből:

```bash
npm run dev:all
```

Ez párhuzamosan elindítja:

- **Frontend** – http://localhost:5173  
- **Backend** – http://localhost:3000  
- **AI service** – http://localhost:8000  

A konzolban színezett prefixekkel jelennek meg a logok: `[frontend]`, `[backend]`, `[ai]`.

### Külön-külön

| Parancs (gyökérből)     | Szolgáltatás | URL                  |
|-------------------------|--------------|-----------------------|
| `npm run dev`           | Frontend     | http://localhost:5173 |
| `npm run dev:backend`   | Backend      | http://localhost:3000 |
| `npm run dev:ai`        | AI service   | http://localhost:8000 |

### Build és preview

- **Frontend build:** `npm run build`  
- **Frontend preview (production build):** `npm run preview`  

### „Nem biztonságos” / HTTPS figyelmeztetés (piros sáv)

A böngésző a **http://** (pl. http://localhost:5173) alatt figyelmeztethet: „This page is not loaded over HTTPS. Your connection may not be secure.” Ez a böngésző saját üzenete, nem az alkalmazásból jön. **Helyi fejlesztésnél nyugodtan figyelmen kívül hagyható**; a forgalom csak a saját gépeden fut. Éles környezetben a frontendot HTTPS-en (TLS) érdemes kiszolgálni, ekkor a figyelmeztetés nem jelenik meg.

Ha szeretnéd helyi HTTPS-t (opcionális): a frontend mappában `npm install @vitejs/plugin-basic-ssl@1.2.0 --save-dev`, majd a `vite.config.ts`-ben add hozzá a `basicSsl()` plugint, és a dev szerver **https://localhost:5173** címen indul (egyszer el kell fogadni a böngészőben a önaláírt tanúsítványt).

## Dokumentáció

- **Specifikáció és napló:** [docs/szakdolgozat_dokumentacio.md](docs/szakdolgozat_dokumentacio.md)  
- **AI modul részletei:** [ai_service/README.md](ai_service/README.md)  
- **Benchmark:** [benchmarks/README.md](benchmarks/README.md) (ha van)
