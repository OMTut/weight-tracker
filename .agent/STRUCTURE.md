# Project Structure

## Root Layout

```
weight-tracker/
├── src/
│   ├── api/                  # FastAPI backend
│   │   ├── main.py           # App entry point with health endpoint
│   │   ├── requirements.txt  # Python dependencies
│   │   └── Dockerfile
│   ├── web/                  # React + Vite frontend
│   │   ├── src/
│   │   │   ├── context/
│   │   │   │   └── AuthContext.tsx  # Auth state, login/logout, session restore
│   │   │   ├── components/
│   │   │   │   ├── ProtectedRoute.tsx  # Redirects unauthenticated users to /login
│   │   │   │   ├── account/         # Account page sub-components (DisplayNameForm, EmailForm, PasswordForm, WeightUnitForm, DeleteAccountCard)
│   │   │   │   └── ui/              # shadcn/ui primitives
│   │   │   ├── pages/
│   │   │   │   ├── LoginPage.tsx    # Public — redirects auth'd users to /dashboard
│   │   │   │   ├── SignupPage.tsx   # Public — redirects auth'd users to /dashboard
│   │   │   │   ├── DashboardPage.tsx
│   │   │   │   └── AccountPage.tsx
│   │   │   ├── lib/
│   │   │   │   ├── api.ts           # Axios instance with JWT interceptors
│   │   │   │   ├── apiService.ts    # Typed API service functions
│   │   │   │   └── utils.ts
│   │   │   ├── types/
│   │   │   │   └── api.ts           # Shared TypeScript interfaces
│   │   │   ├── main.tsx      # React entry point with QueryClientProvider
│   │   │   ├── App.tsx       # TanStack Router setup + route tree
│   │   │   └── index.css
│   │   ├── vite.config.ts    # Vite config with dev proxy to :8000
│   │   ├── package.json
│   │   ├── index.html
│   │   ├── nginx.conf        # Proxy /api/ to api service
│   │   └── Dockerfile
│   ├── docker-compose.yaml   # db (postgres), api, web services
│   ├── playwright.config.ts  # E2E tests (baseURL: localhost:3001)
│   ├── vitest.config.ts      # Unit tests
│   └── package.json          # Root package (vitest, @vitejs/plugin-react)
└── .agent/
    ├── prd/SUMMARY.md        # Project overview
    ├── tasks.json            # Task list with pass status
    ├── tasks/                # Individual task specs
    ├── STEERING.md           # Environment setup notes
    ├── STRUCTURE.md          # This file
    ├── logs/LOG.md           # Session log
    └── screenshots/          # UI screenshots
```

## Tech Stack

- **Frontend**: React 19 + Vite 7 + TypeScript, TanStack Router/Query/Form/Table, Recharts
- **Backend**: FastAPI + SQLAlchemy + PostgreSQL (docker-compose), JWT auth
- **Infra**: Docker + docker-compose, Nginx proxy

## Dev Setup

- API runs on port 8000 (uvicorn locally or docker)
- Web dev server runs on port 3001 (vite with proxy to :8000)
- Playwright requires: `export LD_LIBRARY_PATH=/tmp/playwright-libs/usr/lib/x86_64-linux-gnu:$LD_LIBRARY_PATH`
