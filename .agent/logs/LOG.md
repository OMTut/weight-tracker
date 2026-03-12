# Project Build Log

`Current Status`
=================
**Last Updated:** YYYY-MM-DD HH:MM
**Tasks Completed:** TOTAL_NUMBER_OF_TASKS
**Current Task:** TASK-CURRENT_TASK_NUMBER Complete

----------------------------------------------

## Session Log

### 2026-03-12 — TASK-27: Account Info page layout

- `src/web/src/pages/AccountPage.tsx` already implemented: sticky top bar with back arrow + "Account Info" title, 5 card sections (Display Name, Email Address, Password, Weight Unit, Danger Zone with destructive color)
- Updated `src/tests/account-page.spec.ts`: fixed parallel-run email conflicts (per-worker unique email), added `{ exact: true }` to text locators to avoid strict mode violations
- Screenshots: TASK-27-1 (desktop), TASK-27-2 (mobile)
- All 33 E2E tests pass; TypeScript clean; ESLint clean

### 2026-03-12 — TASK-26: Edit weight entry — inline form in table row

- Updated `src/web/src/components/WeightTable.tsx`: added `editingId`, `editingValue`, `editError`, `savingId` state; Edit menu item sets editingId + prefills editingValue; edit mode renders `Input` (autoFocus) in Weight cell and Save/Cancel buttons in Actions cell; `handleSave` validates positive number, calls `updateWeightEntry`, re-fetches table; `handleCancel` clears state
- Created `src/tests/edit-weight.spec.ts`: 4 Playwright E2E tests (edit mode + prefill, save updates value, cancel no change, invalid value shows error)
- Screenshots: TASK-26-1 (input visible), TASK-26-2 (after save), TASK-26-3 (validation error)
- All 28 E2E tests pass; TypeScript clean; ESLint clean

### 2026-03-12 — TASK-25: Table row actions — ... menu with Edit and Delete

- Updated `src/web/src/components/WeightTable.tsx`: replaced placeholder "..." button with `DropdownMenu` containing `MoreHorizontal` icon trigger, "Edit" and "Delete" menu items; added `handleDelete` async function (tracks `deletingId` state for per-row loading, calls `deleteWeightEntry`, notifies parent via `onEntryDeleted`, re-fetches current page, adjusts page if now empty)
- Created `src/tests/table-actions.spec.ts`: 2 Playwright E2E tests (dropdown opens with Edit/Delete, clicking Delete removes entry)
- Screenshots: TASK-25-1 (open dropdown), TASK-25-2 (after delete — empty state)
- All 24 E2E tests pass (1 unrelated flaky); TypeScript clean; ESLint clean

### 2026-03-12 — TASK-24: Weight table with pagination

- Created `src/web/src/components/WeightTable.tsx`: paginated table with Date (DD.MM.YYYY), Weight (with unit), and Actions columns; null entries sentinel for initial loading; page reset on refreshKey via ref to avoid synchronous setState in effects
- Updated `src/web/src/pages/DashboardPage.tsx`: added WeightTable below WeightChart, passing refreshKey and callbacks
- Installed `date-fns` for ISO date parsing and formatting
- Created `src/tests/weight-table.spec.ts`: 4 Playwright E2E tests (empty state, table columns/formatting, pagination controls, Next disabled on last page)
- Screenshots: TASK-24-1 (table with entry), TASK-24-2 (pagination)
- All 22 E2E tests pass; TypeScript clean; ESLint clean

### 2026-03-12 — TASK-23: Weight area chart with time filter toggle

- Created `src/web/src/components/WeightChart.tsx`: responsive Recharts area chart with 4 time-filter buttons (7d/30d/3m/all), empty state, loading state using `null` sentinel
- Updated `src/web/src/pages/DashboardPage.tsx`: replaced placeholder with `<WeightChart refreshKey={refreshKey} />`
- Updated `src/web/src/lib/apiService.ts`: added `page_size` param to `getWeightEntries`
- Updated `src/api/routers/weight.py`: raised `page_size` max from 100 to 1000 to support chart fetching
- Created `src/tests/weight-chart.spec.ts`: 4 Playwright E2E tests (empty state, filter buttons, chart renders after entry, filter switching)
- Screenshots: TASK-23-1 (chart with data), TASK-23-2 (filter switch)
- All 18 E2E tests pass; TypeScript clean; ESLint clean

### 2026-03-12 — TASK-22: Weight entry form — revealed by + button

- Created `src/web/src/components/WeightEntryForm.tsx`: inline form with weight input, unit label, Submit (loading state), Cancel; uses TanStack Form + z.coerce.number for validation
- Updated `src/web/src/pages/DashboardPage.tsx`: + toggles to X when form open, conditionally renders WeightEntryForm, `refreshKey` state incremented on success for future chart/table refresh
- Created `src/tests/weight-entry.spec.ts`: 3 Playwright E2E tests (toggle, cancel, successful submit hides form)
- Screenshots: TASK-22-1 (form hidden), TASK-22-2 (form visible)
- All 3 E2E tests pass cleanly; TypeScript clean

### 2026-03-12 — TASK-21: Dashboard layout — top bar with username dropdown

- Replaced `src/web/src/pages/DashboardPage.tsx` with sticky top-bar layout: Plus button (left), "HeavyDeets" (center), username DropdownMenu (right) with "Account Info" and "Logout" items
- Created `src/tests/dashboard.spec.ts`: 4 Playwright E2E tests (top bar visible, dropdown options, Account Info → /account, Logout → /login + token cleared)
- Screenshot: TASK-21-1 (desktop dashboard)
- All 4 E2E tests pass; TypeScript clean

### 2026-03-12 — TASK-20: Sign in page

- Replaced `src/web/src/pages/LoginPage.tsx` with full form: shadcn Card, TanStack Form + Zod validators (email, password), loading state, 401 → "Invalid email or password" error
- Fixed `src/web/src/lib/api.ts` 401 interceptor to skip redirect for auth endpoints (login/register) so credential errors are handled by the form
- Created `src/tests/login.spec.ts`: 4 Playwright E2E tests (form render, validation, wrong credentials, successful login → /dashboard + token)
- Screenshots: TASK-20-1 (desktop), TASK-20-2 (validation), TASK-20-3 (mobile)
- All 7 E2E tests pass (4 login + 3 signup); TypeScript clean; ESLint clean

### 2026-03-12 — TASK-19: Sign up page

- Replaced `src/web/src/pages/SignupPage.tsx` with full form: shadcn Card layout, TanStack Form with Zod inline validators (name, email, password), loading state on submit, API error handling (duplicate email), "Log in" link
- Created `src/tests/signup.spec.ts`: 3 Playwright E2E tests (renders form, validation errors, successful signup → /dashboard + token stored)
- Screenshots: TASK-19-1 (desktop), TASK-19-2 (mobile 375px), TASK-19-3 (validation errors)
- All 3 E2E tests pass; TypeScript clean; ESLint clean

### 2026-03-12 — TASK-18: Frontend — auth context, routing, and protected routes

- Created `src/web/src/context/AuthContext.tsx`: `AuthProvider` with `user`, `isLoading`, `login()`, `logout()` — reads token from localStorage on mount, calls `getMe()` to restore session, uses `useNavigate` from TanStack Router for logout redirect
- Created `src/web/src/components/ProtectedRoute.tsx`: renders spinner while loading, redirects to `/login` if no user, else renders `<Outlet />`
- Created placeholder pages: `LoginPage`, `SignupPage` (redirect authenticated users → /dashboard), `DashboardPage`, `AccountPage`
- Replaced `src/web/src/App.tsx` with TanStack Router setup: root route wraps children in `AuthProvider`, public routes `/login`/`/signup`, protected layout wraps `/dashboard`/`/account`, `/` redirects to `/dashboard`
- TypeScript clean, ESLint clean, full build passes (220 modules), 68 API tests pass

### 2026-03-12 — TASK-17: Frontend — API client with auth token management

- Created `src/web/src/types/api.ts`: User, AuthResponse, WeightEntry, PaginatedWeightResponse interfaces
- Created `src/web/src/lib/api.ts`: Axios instance with baseURL from VITE_API_URL env var, request interceptor (attaches Bearer token from localStorage key 'auth_token'), response interceptor (401 → clear token + redirect to /login)
- Created `src/web/src/lib/apiService.ts`: typed service functions for all API endpoints (auth, weight CRUD, user profile/password/preferences/delete)
- Build passes (TypeScript clean)

### 2026-03-12 — TASK-16: Frontend — install and configure dependencies

- Installed axios, TailwindCSS v4 (`@tailwindcss/vite`), `tw-animate-css`, `class-variance-authority`, `lucide-react`
- Added `@/*` path alias to `tsconfig.app.json` and `tsconfig.json` (needed by shadcn CLI)
- Updated `vite.config.ts`: added `@tailwindcss/vite` plugin and `@/` resolve alias
- Ran `npx shadcn@latest init -d -y` to initialize shadcn/ui (New York style, Neutral color, CSS variables)
- Added shadcn/ui components: button, input, label, card, dropdown-menu, dialog, table, select, separator
- Rewrote `src/index.css` with clean TailwindCSS v4 + shadcn theme (oklch color space, @theme inline block)
- Build passes: `npm run build` succeeds, TypeScript clean, 78 modules transformed
- Dev server starts on port 3001

### 2026-03-12 — TASK-15: DELETE /api/user/me — delete account and all data

- Added `PRAGMA foreign_keys=ON` event listener to `src/api/database.py` for SQLite cascade delete support
- Added `DELETE /me` endpoint to `src/api/routers/user.py`: deletes current user + cascades weight entries, returns 204
- Created `src/api/tests/test_user_delete.py` with 4 tests (204 success, JWT invalid after delete, cascade weight entries, no token→403)
- All 68 tests pass

### 2026-03-12 — TASK-14: PATCH /api/user/preferences — update weight unit preference

- Added `UpdatePreferencesRequest` schema to `src/api/schemas/user.py` with `weight_unit: Literal['lbs', 'kg']`
- Added `PATCH /api/user/preferences` endpoint to `src/api/routers/user.py`: updates `weight_unit`, returns `UserResponse`
- Created `src/api/tests/test_user_preferences.py` with 4 tests (kg→200, lbs→200, 'pounds'→422, no token→403)
- All 64 tests pass

### 2026-03-11 — TASK-13: PATCH /api/user/password — update user password

- Added `UpdatePasswordRequest` schema to `src/api/schemas/user.py` with `new_password (str, min_length=8)`
- Added `PATCH /api/user/password` endpoint to `src/api/routers/user.py`: verifies current password (400 on mismatch), hashes and stores new password
- Created `src/api/tests/test_user_password.py` with 5 tests (success, login with new password, wrong current→400, too short→422, no token→403)
- All 60 tests pass

### 2026-03-11 — TASK-12: PATCH /api/user/profile — update name and email

- Created `src/api/schemas/user.py` with `UpdateProfileRequest` (optional name/email fields)
- Created `src/api/routers/user.py` with `PATCH /api/user/profile`: updates name and/or email, checks email uniqueness (400 on conflict), returns `UserResponse`
- Registered user router in `main.py`
- Created `src/api/tests/test_user_profile.py` with 6 tests (update name, update email, email conflict→400, persistence in /me, no token→403, same email no conflict)
- All 55 tests pass

### 2026-03-11 — TASK-11: DELETE /api/weight/{id} — delete weight entry

- Added `DELETE /{entry_id}` endpoint to `src/api/routers/weight.py`: validates ownership (404 if not found, 403 if wrong user), deletes entry, returns 204 No Content
- Created `src/api/tests/test_weight_delete.py` with 6 tests (success, entry removed, double-delete→404, not found, other user→403, no token→403)
- All 49 tests pass

### 2026-03-11 — TASK-10: PUT /api/weight/{id} — update weight entry value

- Added `UpdateWeightRequest` schema to `src/api/schemas/weight.py` with `weight_value (float, gt=0)`
- Added `PUT /{entry_id}` endpoint to `src/api/routers/weight.py`: validates ownership (404 if not found, 403 if wrong user), updates `weight_value`, returns `WeightEntryResponse`
- Created `src/api/tests/test_weight_update.py` with 7 tests (success, recorded_at unchanged, 404, 403 other user, zero→422, negative→422, no token→403)
- All 43 tests pass

### 2026-03-11 — TASK-9: POST /api/weight — log new weight entry

- Added `CreateWeightRequest` schema to `src/api/schemas/weight.py` with `weight_value (float, gt=0)`
- Added `POST /` endpoint to `src/api/routers/weight.py`: creates entry with `date.today()` server-side, returns 201 with `WeightEntryResponse`
- Created `src/api/tests/test_weight_create.py` with 5 tests (success, zero→422, negative→422, no token→403, user association)
- All 36 tests pass

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
