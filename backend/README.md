# Snake Backend

Express + SQLite: regisztráció, bejelentkezés (bcrypt, JWT), profil, pontszámok.

## Telepítés és futtatás

```bash
cd backend
npm install
npm run dev
```

A szerver a **3000** porton fut. A frontend alapból a `http://localhost:3000` címet hívja (vagy `VITE_API_URL` környezeti változó).

## API

- **POST /api/auth/register** – body: `email`, `username`, `password`, `passwordConfirm`
- **POST /api/auth/login** – body: `usernameOrEmail`, `password` → `{ token, user }`
- **GET /api/profile/me** – Bearer token → `{ user }`
- **PATCH /api/profile/me** – Bearer token, body: `username`
- **PATCH /api/profile/me/password** – Bearer token, body: `currentPassword`, `newPassword`, `newPasswordConfirm`
- **GET /api/scores** – Bearer token → `{ scores }` (a bejelentkezett user eredményei)
- **POST /api/scores** – Bearer token, body: `score`, `tick`, `length`, `mode` (`player`|`ai`), `ai_strategy` (`astar`|`hamilton`|null)

## Adatbázis

SQLite fájl: `backend/data/snake.db` (automatikusan létrejön). Táblák: `users`, `scores` (user_id, score, tick, length, mode, ai_strategy, created_at).

## Jelszó

bcrypt (10 kör), JWT 7 napos érvényességgel. Éles környezetben állíts be `JWT_SECRET` környezeti változót.
