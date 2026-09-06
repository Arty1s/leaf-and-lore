# Leaf & Lore

A personal and small-group reading tracker focused on thoughtful reading analytics, not streaks.

## Stack

- Frontend: React 18, TypeScript, Vite, React Router, TanStack Query, Recharts
- Backend: FastAPI, SQLAlchemy 2, Pydantic, SQLite locally (PostgreSQL-ready)
- Integration boundary: JSON API used by both the web client and a future Discord bot

## Local development

```powershell
cd backend
python -m venv .venv
.venv\Scripts\pip install -r requirements.txt
.venv\Scripts\uvicorn app.main:app --reload
```

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

The API is available at `http://localhost:8000` and its OpenAPI docs at `/docs`.

## Product boundaries

- Reading sessions are the source of truth for pages, time, and speed statistics.
- Speed is contextual and can be grouped by book and difficulty.
- There are no streaks or global leaderboards.
- Discord is an API client, never the owner of application data.

