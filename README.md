# FoodRush

A full-stack food ordering platform with customer ordering, restaurant management, admin controls, and an AI-powered food discovery chatbot.

## Features

- **Customers** — Browse restaurants, view menus, place orders, track status
- **Restaurant owners** — Manage menu items, process orders, update order status
- **Admins** — Monitor all orders, cancel orders platform-wide
- **Chatbot** — Groq-powered food discovery from live menu data (local search fallback without API key)

## Tech Stack

| Layer | Stack |
|-------|-------|
| Frontend | Next.js 14, React, TypeScript, Tailwind CSS |
| Backend | NestJS, TypeORM, PostgreSQL |
| Auth | JWT, HTTP-only cookies, RBAC |
| AI | Groq API (Llama 3) |

## Quick Start

### 1. Start PostgreSQL

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env — set JWT_SECRET; GROQ_API_KEY is optional (chatbot uses local search without it)
npm install
npm run start:dev
```

API runs at [http://localhost:3001/api](http://localhost:3001/api).

### 3. Seed demo data

```bash
cd backend
npm run seed
```

Creates 6 restaurants, 33 menu items, 4 customers, 6 restaurant owners, and 1 admin — all with local SVG image URLs.

### 4. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

If you see chunk or cache errors after switching between `build` and `dev`:

```bash
cd frontend
npm run dev:clean
```

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@foodrush.com` | `admin123` |
| Customer | `customer@foodrush.com` | `cust123` |
| Customer | `sara@foodrush.com` | `cust123` |
| Restaurant | `restaurant@foodrush.com` | `rest123` |
| Restaurant | `wok@foodrush.com` | `rest123` |

All restaurant owner accounts use password `rest123`. See [Database Design](./docs/database-design.md#seed-data) for the full list.

## Documentation

| Document | Description |
|----------|-------------|
| [Requirements](./docs/requirements.md) | Project requirements |
| [Architecture](./docs/architecture.md) | System design and flows |
| [Database Design](./docs/database-design.md) | Schema and ERD |
| [API Specification](./docs/api-specification.md) | REST API reference |
| [Testing Checklist](./docs/testing-checklist.md) | QA verification checklist |
| [Deployment Guide](./docs/deployment-guide.md) | Local and production setup |

## API

Base URL: `http://localhost:3001/api`

Health check: `GET /api` — returns API status and available route prefixes.

See [API Specification](./docs/api-specification.md) for full endpoint documentation.

Postman collection: `docs/postman/FoodRush-API.postman_collection.json`

## Project Structure

```
FoodRush/
├── backend/          # NestJS API
│   └── src/
│       ├── auth/
│       ├── users/
│       ├── restaurants/
│       ├── menus/
│       ├── orders/
│       ├── chatbot/
│       ├── seed-data.ts
│       ├── seed.ts
│       └── migrations/
├── frontend/         # Next.js app
│   ├── public/images/   # Restaurant & menu SVG assets
│   └── src/
│       ├── app/         # Pages
│       ├── components/
│       ├── context/
│       └── lib/
├── docs/             # Documentation
└── docker-compose.yml
```

## Scripts

| Location | Command | Description |
|----------|---------|-------------|
| `backend/` | `npm run seed` | Populate demo users, restaurants, menus |
| `frontend/` | `npm run generate:images` | Regenerate food SVG assets |
| `frontend/` | `npm run dev:clean` | Clear `.next` cache and start dev server |

## License

MIT
