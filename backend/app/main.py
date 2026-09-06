from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text

from app import models as _models  # noqa: F401 - registers SQLAlchemy metadata
from app.api import request_token, router as api_router
from app.config import settings
from app.database import Base, engine
from app.seed import seed_demo_data


app = FastAPI(title=settings.app_name, version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=list({
        settings.frontend_origin,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    }),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(api_router)


@app.middleware("http")
async def authentication_context(request, call_next):
    authorization = request.headers.get("authorization", "")
    token = authorization.removeprefix("Bearer ").strip() if authorization.startswith("Bearer ") else None
    context_token = request_token.set(token)
    try:
        return await call_next(request)
    finally:
        request_token.reset(context_token)


@app.on_event("startup")
def create_tables() -> None:
    Base.metadata.create_all(bind=engine)
    if engine.dialect.name == "sqlite":
        user_columns = {column["name"] for column in inspect(engine).get_columns("users")}
        with engine.begin() as connection:
            if "banner_url" not in user_columns:
                connection.execute(text("ALTER TABLE users ADD COLUMN banner_url TEXT"))
            if "tagline" not in user_columns:
                connection.execute(text("ALTER TABLE users ADD COLUMN tagline TEXT"))
    seed_demo_data()


@app.get("/api/health", tags=["system"])
def health() -> dict[str, str]:
    return {"status": "ok"}
