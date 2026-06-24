# FoodRush

A full-stack food ordering platform with customer ordering, restaurant management, admin controls, and an AI-powered food discovery chatbot.

## Features

- **Customers** — Browse restaurants, view menus, place orders, track status
- **Restaurant owners** — Manage menu items, process orders, update order status
- **Admins** — Monitor all orders, cancel orders platform-wide
- **Chatbot** — Groq-powered food discovery from live menu data

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

### 3. Seed demo data

```bash
cd backend
npm run seed
```

### 4. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@foodrush.com` | `admin123` |
| Restaurant | `restaurant@foodrush.com` | `rest123` |
| Customer | `customer@foodrush.com` | `cust123` |

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
│       └── migrations/
├── frontend/         # Next.js app
│   └── src/
│       ├── app/      # Pages
│       ├── components/
│       ├── context/
│       └── lib/
├── docs/             # Documentation
└── docker-compose.yml
```

## License

MIT
