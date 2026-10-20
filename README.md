# Mini CRM

Full-stack CRM built with React + Vite + TypeScript, Node + Express, MongoDB Atlas.

## Features

- Register/login/logout with JWT in an httpOnly cookie
- Protected routes and `/api/auth/me`
- Customer CRUD, search, status filtering and server pagination
- Customer detail with nested deals/tasks
- Deal CRUD and pipeline stages
- Task CRUD with automatic overdue calculation
- Dashboard metrics and pipeline-by-stage aggregation
- Zod validation, bcrypt, helmet, CORS allowlist and rate limiting
- User-owned data isolation
- Responsive UI
- Backend API tests

## Local setup

### Server

```bash
cd server
npm install
copy .env.example .env
npm run dev
```

### Client

```bash
cd client
npm install
copy .env.example .env
npm run dev
```

## Environment variables

Server:

| Variable | Example |
|---|---|
| MONGO_URI | mongodb+srv://... |
| JWT_SECRET | long-random-secret |
| CLIENT_URL | http://localhost:5173 |
| PORT | 5000 |
| NODE_ENV | development |

Client:

| Variable | Example |
|---|---|
| VITE_API_URL | http://localhost:5000 |

## API

- POST `/api/auth/register`
- POST `/api/auth/login`
- POST `/api/auth/logout`
- GET `/api/auth/me`
- GET/POST `/api/customers`
- GET/PATCH/DELETE `/api/customers/:id`
- GET/POST `/api/deals`
- PATCH/DELETE `/api/deals/:id`
- GET/POST `/api/tasks`
- PATCH/DELETE `/api/tasks/:id`
- GET `/api/dashboard`

## Deployment

Deploy `server` as a Render web service and `client` as a Vercel project.
Set the production environment variables and configure the Vercel SPA rewrite.
