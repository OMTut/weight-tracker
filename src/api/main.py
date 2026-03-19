import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
import models.user  # noqa: F401 — ensures User model is registered with Base
import models.weight_entry  # noqa: F401 — ensures WeightEntry model is registered with Base
from routers.auth import router as auth_router
from routers.user import router as user_router
from routers.weight import router as weight_router


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

_origins_env = os.getenv("ALLOWED_ORIGINS")
if not _origins_env:
    raise RuntimeError("ALLOWED_ORIGINS environment variable is required")
allowed_origins = [o.strip() for o in _origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(user_router)
app.include_router(weight_router)


@app.get("/health")
def health():
    return {"status": "ok"}
