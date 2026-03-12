# Project Build Log

`Current Status`
=================
**Last Updated:** YYYY-MM-DD HH:MM
**Tasks Completed:** TOTAL_NUMBER_OF_TASKS
**Current Task:** TASK-CURRENT_TASK_NUMBER Complete

----------------------------------------------

## Session Log

### 2026-03-11 — TASK-8: GET /api/weight — list weight entries with pagination and time filter

- Created `src/api/schemas/weight.py` with `WeightEntryResponse` and `PaginatedWeightResponse` schemas
- Created `src/api/routers/weight.py` with `GET /api/weight/` endpoint supporting page, page_size, time_filter ('7d', '30d', '3m', 'all') query params
- Registered weight router in `main.py`
- Created `src/api/tests/test_weight_list.py` with 7 tests (empty list, user isolation, sort order, time filter, pagination, no token, invalid token)
- All 31 tests pass

### 2026-03-11 — TASK-7: JWT auth dependency — protect API endpoints

- Created `src/api/dependencies/auth.py` with `get_current_user` dependency using `HTTPBearer`
- Dependency extracts Bearer token, decodes JWT, queries DB for user, raises 401 on any failure
- Added `GET /api/auth/me` endpoint to `src/api/routers/auth.py` that returns current user profile
- Created `src/api/tests/test_auth_me.py` with 4 tests (success, no token → 403, invalid token → 401, deleted user → 401)
- All 24 tests pass

### 2026-03-11 — TASK-6: POST /api/auth/login — authenticate user and return JWT

- Added `LoginRequest` schema to `src/api/schemas/auth.py`
- Implemented `POST /api/auth/login` in `src/api/routers/auth.py` with user enumeration-safe 401 errors
- Created `src/api/tests/test_auth_login.py` with 4 tests (success, wrong password, unknown email, same error message)
- All 20 tests pass

### 2026-03-11 — TASK-5: POST /api/auth/register — create new user account

- Created `src/api/schemas/auth.py` with RegisterRequest, UserResponse, AuthResponse Pydantic schemas
- Created `src/api/routers/auth.py` with POST /api/auth/register endpoint (201 on success, 400 on duplicate email)
- Registered auth router in `main.py`
- Added `email-validator==2.2.0` to requirements.txt and installed it
- Added `httpx` for FastAPI TestClient support
- All 16 tests pass (5 new register tests + 11 existing)

### 2026-03-11 — TASK-4: JWT token utility and password hashing setup

- Created `src/api/dependencies/security.py` with hash_password/verify_password (using bcrypt directly, bypassing passlib incompatibility with bcrypt 5.x) and create_access_token/decode_access_token (python-jose HS256, 30-day expiry, SECRET_KEY from env)
- Added SECRET_KEY env var to src/docker-compose.yaml api service
- All 11 tests pass (6 new security tests + 5 existing)

### 2026-03-11 — TASK-3: FastAPI project structure and dependencies setup

- Updated requirements.txt: added python-jose[cryptography]==3.3.0, passlib[bcrypt]==1.7.4, python-dotenv==1.0.1; pinned fastapi==0.115.12, uvicorn==0.32.1
- Created routers/, schemas/, dependencies/ directories with __init__.py files
- Updated docker-compose.yaml: removed Postgres db service, added sqlite_data volume, set DATABASE_URL=sqlite:////app/data/db.sqlite for api service
- Updated Dockerfile: added RUN mkdir -p /app/data
- Updated database.py default DATABASE_URL to use relative path for local dev
- Fixed test_user_model.py to import models.weight_entry so User relationship resolves
- Verified: GET /health returns {"status": "ok"}, all 5 tests pass

### 2026-03-11 — TASK-2: weight_entries table schema

- Created `src/api/models/weight_entry.py` with WeightEntry model (id UUID PK, user_id FK→users.id CASCADE, weight_value Float, recorded_at Date, created_at DateTime)
- Added `weight_entries` relationship to User model with cascade delete-orphan
- Registered WeightEntry import in `main.py` so table is created on startup
- Verified: table columns and FK to users.id confirmed via PRAGMA queries

### 2026-03-11 — Steering Setup

- Installed Python pip and FastAPI/uvicorn dependencies
- Installed Node dependencies for web project (fresh install to fix rollup native binary issue)
- Installed Playwright chromium browser
- Manually downloaded required shared libraries to `/tmp/playwright-libs/` (libnspr4, libnss3, libatk, etc.) since sudo not available
- Added `LD_LIBRARY_PATH` to `~/.bashrc` for persistence
- Updated `vite.config.ts` to proxy `/api` to `:8000` and serve on port 3001
- Started dev server (API on :8000, Vite on :3001) and took initial screenshot
- Screenshot: `.agent/screenshots/steering-initial.png`
