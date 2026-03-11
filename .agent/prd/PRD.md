# HeavyDeets — Product Requirements Document

## 1. App Overview

**HeavyDeets** is a minimalistic, mobile-friendly weight tracking web application. Users log their body weight over time and visualize trends via an area chart. The app is intended for a small group of users (friends & family) with individual accounts and private data.

### Objectives
- Allow users to log daily weight entries quickly
- Visualize weight trends over configurable time ranges
- Manage historical entries (edit, delete)
- Provide account management (name, email, password, unit preference)

### Success Criteria
- A user can sign up, log in, and log their first weight entry in under 2 minutes
- Chart updates immediately after a new entry is submitted
- All data is private per user — no cross-account data leakage
- App is fully usable on mobile (375px viewport)

---

## 2. Target Audience

Small group of personal users (friends & family). Not a commercial product. No onboarding flow required beyond sign up. Users are assumed to be non-technical.

---

## 3. Core Features

### 3.1 Authentication
- Email + password sign up
- Email + password sign in
- Persistent sessions via JWT stored in localStorage
- Logout
- No password reset (out of scope)

### 3.2 Dashboard
Single-page dashboard after login containing:
- **Top bar**: + button (left), app name (center), username (right)
- **Weight entry form**: revealed on + click, hidden on submit/cancel
- **Area chart**: weight over time with 4 time filter options
- **Weight table**: paginated list of all entries with edit/delete actions

### 3.3 Weight Logging
- User clicks + in top bar → form slides in
- Form fields: weight value (number, required)
- Date is set automatically to today's date — user cannot select date
- Unit displayed next to input based on user preference (lbs by default)
- On submit: form hides, chart and table refresh
- Validation: weight must be a positive number

### 3.4 Weight Table
- Columns: Date | Weight | Actions
- Date formatted as `DD.MM.YYYY`
- Weight displayed as decimal (e.g. `206.5`) with unit label
- Actions: `...` button opens dropdown with **Edit** and **Delete**
- Edit: weight value only (date cannot be changed)
- Delete: removes entry immediately (no confirmation dialog)
- Paginated: 10 entries per page, with previous/next controls

### 3.5 Area Chart
- X-axis: date, Y-axis: weight
- Time filter toggle buttons: Last 7 Days | Last 30 Days | Last 3 Months | All Time
- Smooth area chart using Recharts
- Responsive width

### 3.6 Account Info
Accessible from username dropdown:
- Change display name
- Change email address
- Change password (requires current password)
- Select weight unit preference (lbs / kg) — defaults to lbs
- Delete account (with confirmation dialog — permanently deletes user and all entries)

---

## 4. Key User Flows

### Sign Up
1. User visits `/signup`
2. Fills in name, email, password → submits
3. Account created → redirected to `/dashboard`

### Sign In
1. User visits `/login`
2. Fills in email, password → submits
3. JWT stored → redirected to `/dashboard`

### Log Weight
1. User clicks + in top bar
2. Weight entry form appears below top bar
3. User types weight value → clicks Submit
4. Form hides → chart and table refresh with new entry

### Edit Weight
1. User finds entry in table → clicks `...`
2. Clicks Edit → weight input appears inline or modal
3. User updates weight → saves
4. Table row updates

### Delete Weight
1. User clicks `...` on a table row
2. Clicks Delete → entry removed immediately
3. Table and chart refresh

### Account Info
1. User clicks their name in top bar → dropdown opens
2. Clicks "Account Info" → navigates to `/account`
3. Updates name / email / password / unit preference via separate forms
4. Clicks "Delete Account" → confirmation dialog → account and all data deleted → redirected to `/login`

---

## 5. Technical Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| UI Components | shadcn/ui |
| Styling | TailwindCSS |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| HTTP Client | Axios |
| Routing | React Router v6 |
| Backend | Python 3.11 + FastAPI |
| ORM | SQLAlchemy 2.0 |
| Database | SQLite (file-based, persisted via Docker volume) |
| Auth | JWT (python-jose) + bcrypt (passlib) |
| Infrastructure | Docker + docker-compose |

---

## 6. Conceptual Data Model

### `users` table
| Field | Type | Constraints |
|---|---|---|
| id | UUID | PRIMARY KEY |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| name | VARCHAR(255) | NOT NULL |
| hashed_password | TEXT | NOT NULL |
| weight_unit | VARCHAR(3) | DEFAULT 'lbs', CHECK IN ('lbs', 'kg') |
| created_at | DATETIME | DEFAULT now() |

### `weight_entries` table
| Field | Type | Constraints |
|---|---|---|
| id | UUID | PRIMARY KEY |
| user_id | UUID | FOREIGN KEY → users.id, ON DELETE CASCADE |
| weight_value | FLOAT | NOT NULL, > 0 |
| recorded_at | DATE | NOT NULL (set to today server-side) |
| created_at | DATETIME | DEFAULT now() |

---

## 7. API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Create new user account |
| POST | `/api/auth/login` | Authenticate and receive JWT |
| POST | `/api/auth/logout` | Client-side token invalidation |
| GET | `/api/auth/me` | Get current user from JWT |
| GET | `/api/weight` | List weight entries (paginated, time filter) |
| POST | `/api/weight` | Log new weight entry |
| PUT | `/api/weight/{id}` | Update weight value |
| DELETE | `/api/weight/{id}` | Delete weight entry |
| PATCH | `/api/user/profile` | Update name and/or email |
| PATCH | `/api/user/password` | Update password |
| PATCH | `/api/user/preferences` | Update weight unit preference |
| DELETE | `/api/user/me` | Delete account and all entries |

---

## 8. UI Design Principles

- **Mobile-first**: All layouts must work on 375px viewport
- **Minimalistic**: Clean whitespace, minimal color palette
- **shadcn/ui components**: Use Button, Input, Table, DropdownMenu, Dialog, Select, Card
- **TailwindCSS**: Utility-first, no custom CSS files unless unavoidable
- **Consistent spacing**: 4px grid (Tailwind default)
- **No icons library** beyond what shadcn/ui includes (lucide-react)

---

## 9. Security Considerations

- Passwords hashed with bcrypt (passlib, 12 rounds)
- JWT tokens signed with HS256, expire after 30 days
- JWT stored in localStorage (acceptable for personal tool, no XSS vectors from user content)
- All `/api/weight` and `/api/user` endpoints require valid JWT
- Users can only read/write their own weight entries (enforced by `user_id` filter on all queries)
- CORS restricted to frontend origin (`http://localhost:3001`)

---

## 10. Infrastructure

- `docker-compose.yaml` defines two services: `api` and `web`
- SQLite database file stored at `/app/data/db.sqlite` inside the `api` container
- Docker volume `sqlite_data` mounts to `/app/data` for persistence
- Frontend served via nginx on port 3001
- API served via uvicorn on port 8000
- Frontend proxies `/api/*` requests to the API (nginx proxy_pass)

---

## 11. Development Phases

### Phase 1 — Foundation
- Database schema and FastAPI setup
- Auth endpoints (register, login)
- JWT middleware

### Phase 2 — Core Features
- Weight CRUD endpoints
- Dashboard UI (chart, table, entry form)

### Phase 3 — Account Management
- Account Info page
- Profile update endpoints
- Delete account

### Phase 4 — Polish
- Responsive testing
- Unit preference
- Pagination

---

## 12. Assumptions & Dependencies

- Single deployment, not publicly hosted
- No email service required (no password reset)
- SQLite is sufficient for < 50 users
- All users are trusted (no abuse/moderation features needed)
- Docker Desktop available on host machine
- Node.js 18+ and Python 3.11+ available for local development
