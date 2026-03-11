## Overview

HeavyDeets is a minimalistic, mobile-friendly weight tracking web app for a small group of users. Users create accounts, log their daily weight, and visualize trends over time via an area chart. All data is private per user.

## Main Features

- Email/password authentication (sign up, log in, log out)
- Dashboard with a + button to log weight (date auto-set to today)
- Area chart showing weight over time with 4 time filters (7d, 30d, 3m, all time)
- Paginated weight table with edit and delete actions per entry
- Account management: change name, email, password, weight unit (lbs/kg), delete account

## Key User Flows

1. Sign up → redirected to dashboard
2. Click + → enter weight → chart and table update
3. Click ... on a table row → Edit or Delete entry
4. Click username → Account Info → manage profile settings

## Key Requirements

- React + Vite + TypeScript frontend with TailwindCSS and shadcn/ui
- Python FastAPI backend with SQLAlchemy and SQLite database
- JWT authentication (python-jose + passlib/bcrypt)
- Docker + docker-compose deployment (api + web services)
- Nginx proxy forwards /api/* to the FastAPI backend
- Weight unit defaults to lbs; user can switch to kg in Account settings
- App runs at http://localhost:3001
