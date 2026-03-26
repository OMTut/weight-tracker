# Weight Tracker

A simple, private weight tracking app you can run on your own computer or server. Log your weight over time, view your progress on a chart, and manage your account — no third-party services, no data leaving your machine.

## Features

- Log daily weight entries
- Visual progress chart
- Account management (change email, password, or delete your account)
- Runs entirely on your own hardware

## Self-Hosting

The easiest way to run Weight Tracker is with [Docker](https://www.docker.com/products/docker-desktop/). If you have Docker installed, the whole app starts with one command.

### 1. Download the config files

Clone this repository or [download it as a ZIP](../../archive/refs/heads/master.zip) and open the root folder.

### 2. Create your environment file

In the root folder (next to `docker-compose.yml`), create a file named `.env` with the following contents:

```
SECRET_KEY=replace-this-with-a-long-random-string
ALLOWED_ORIGINS=http://localhost:3001
ALLOW_PASSWORD_RESET=false
```

**`SECRET_KEY`** — A secret used to secure your login sessions. Make it long and random. You can generate one at [randomkeygen.com](https://randomkeygen.com).

**`ALLOWED_ORIGINS`** — The address you'll use to access the app in your browser. If you're running it on your local machine, `http://localhost:3001` is correct. If you're hosting it on a server with a domain name, put that here instead (e.g. `https://weight.yourdomain.com`).

**`ALLOW_PASSWORD_RESET`** — Set to `true` if you want to allow password resets. Defaults to `false`.

### 3. Start the app

From the root folder (where `docker-compose.yml` lives), run:

```bash
docker compose up -d
```

Then open your browser and go to `http://localhost:3001`.

To stop the app:

```bash
docker compose down
```

Your data is saved in a Docker volume and will persist between restarts.

---

## Updating

To pull the latest version and restart:

```bash
docker compose pull
docker compose up -d
```

---

## Built With

- [FastAPI](https://fastapi.tiangolo.com/) (backend)
- [React](https://react.dev/) (frontend)
- [SQLite](https://www.sqlite.org/) (database)
- [Docker](https://www.docker.com/) (deployment)
