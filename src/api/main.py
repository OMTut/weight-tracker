import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
import models.user  # noqa: F401 — ensures User model is registered with Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create database tables on startup."""
    from database import DATABASE_URL

    if DATABASE_URL.startswith("sqlite:///"):
        db_path = DATABASE_URL.replace("sqlite:///", "")
        data_dir = os.path.dirname(db_path)
        if data_dir:
            os.makedirs(data_dir, exist_ok=True)
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Weight Tracker API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}
