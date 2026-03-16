# Full-Stack Task Manager — .NET 8 + React + TypeScript + Docker

[![CI/CD](https://github.com/miteshdekate93/taskflow/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/miteshdekate93/taskflow/actions/workflows/ci-cd.yml)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/compose/)
[![.NET 8](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A production-ready full-stack Task Manager demonstrating modern software engineering practices — JWT authentication, clean REST API design, containerization, and CI/CD automation.

---

## Key Features

- **JWT Authentication** — Secure register/login with Bearer token authorization
- **Task CRUD** — Create, read, update, delete tasks with due dates and completion status
- **User Isolation** — Each user sees only their own tasks
- **Swagger UI** — Interactive API documentation out of the box
- **Docker Compose** — One command spins up Postgres + API + Frontend
- **GitHub Actions CI/CD** — Automated build, test, and Docker image build on every push
- **Responsive UI** — Tailwind CSS with mobile-first design
- **React Query** — Server state management with caching and background refetch

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Browser                          │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │   React 18 + TypeScript (Vite)              │   │
│  │   Tailwind CSS  │  React Query  │  Axios    │   │
│  │   React Router  │  JWT storage  │  Forms    │   │
│  └──────────────────────┬──────────────────────┘   │
└─────────────────────────│───────────────────────────┘
                          │ HTTP / REST
                          ▼
┌─────────────────────────────────────────────────────┐
│         .NET 8 Minimal API  (port 5000)             │
│                                                     │
│   ┌──────────┐  ┌──────────┐  ┌────────────────┐  │
│   │  Auth    │  │  Tasks   │  │  Swagger / OAS │  │
│   │ Endpoints│  │ Endpoints│  │  Health Check  │  │
│   └──────────┘  └──────────┘  └────────────────┘  │
│                                                     │
│   ┌─────────────────────────────────────────────┐  │
│   │     EF Core 8  +  Npgsql Provider           │  │
│   └──────────────────────┬──────────────────────┘  │
└─────────────────────────-│───────────────────────── ┘
                           │
                           ▼
┌─────────────────────────────────────────────────────┐
│         PostgreSQL 16  (port 5432)                  │
│         Volumes: pgdata                             │
└─────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer      | Technology               | Version |
|------------|--------------------------|---------|
| Frontend   | React                    | 18.x    |
| Frontend   | TypeScript               | 5.x     |
| Frontend   | Vite                     | 5.x     |
| Frontend   | Tailwind CSS             | 3.x     |
| Frontend   | React Query              | 5.x     |
| Frontend   | React Router             | 6.x     |
| Frontend   | Axios                    | 1.x     |
| Backend    | .NET                     | 8.0     |
| Backend    | ASP.NET Core Minimal API | 8.0     |
| Backend    | Entity Framework Core    | 8.0     |
| Backend    | Npgsql EF Provider       | 8.0     |
| Backend    | JWT Bearer Auth          | 8.0     |
| Backend    | Swashbuckle (Swagger)    | 6.5     |
| Backend    | BCrypt.Net               | 4.0     |
| Database   | PostgreSQL               | 16      |
| Container  | Docker / Docker Compose  | 3.9     |
| CI/CD      | GitHub Actions           | —       |

---

## Quick Start (Docker)

> Prerequisites: [Docker Desktop](https://www.docker.com/products/docker-desktop/)

```bash
git clone https://github.com/miteshdekate93/taskflow.git
cd fullstack-dotnet-react
docker compose up --build
```

| Service     | URL                              |
|-------------|----------------------------------|
| Frontend    | http://localhost:3000            |
| API         | http://localhost:5000            |
| Swagger UI  | http://localhost:5000/swagger    |
| Health Check| http://localhost:5000/health     |
| PostgreSQL  | localhost:5432                   |

---

## Manual Setup

### Backend

```bash
cd backend

# Restore packages
dotnet restore

# Apply EF Core migrations (requires PostgreSQL running)
dotnet ef database update

# Run the API
dotnet run
```

The API will start at `http://localhost:5000`. Swagger is available at `/swagger`.

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server (proxies /api to localhost:5000)
npm run dev
```

The frontend will start at `http://localhost:5173`.

---

## API Endpoints

### Authentication

| Method | Endpoint              | Description             | Auth Required |
|--------|-----------------------|-------------------------|---------------|
| POST   | `/api/auth/register`  | Register a new user     | No            |
| POST   | `/api/auth/login`     | Login, returns JWT      | No            |

### Tasks

| Method | Endpoint              | Description             | Auth Required |
|--------|-----------------------|-------------------------|---------------|
| GET    | `/api/tasks`          | Get all tasks for user  | Yes           |
| POST   | `/api/tasks`          | Create a new task       | Yes           |
| PUT    | `/api/tasks/{id}`     | Update a task           | Yes           |
| DELETE | `/api/tasks/{id}`     | Delete a task           | Yes           |

### System

| Method | Endpoint   | Description   |
|--------|------------|---------------|
| GET    | `/health`  | Health check  |

**Example — Register:**
```json
POST /api/auth/register
{
  "username": "alice",
  "password": "SecurePass123!"
}
```

**Example — Create Task:**
```json
POST /api/tasks
Authorization: Bearer <token>
{
  "title": "Review pull request",
  "description": "Check the feature branch before merge",
  "dueDate": "2024-12-31T00:00:00Z"
}
```

---

## Project Structure

```
fullstack-dotnet-react/
├── backend/
│   ├── Models/
│   │   ├── TaskItem.cs
│   │   └── User.cs
│   ├── Data/
│   │   └── AppDbContext.cs
│   ├── Services/
│   │   └── TokenService.cs
│   ├── Program.cs
│   ├── TaskManager.Api.csproj
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── authApi.ts
│   │   │   └── tasksApi.ts
│   │   ├── components/
│   │   │   ├── TaskCard.tsx
│   │   │   └── TaskForm.tsx
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   └── TasksPage.tsx
│   │   ├── types/
│   │   │   └── Task.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── nginx.conf
│   └── Dockerfile
├── .github/
│   └── workflows/
│       └── ci-cd.yml
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## Screenshots

> _Screenshots coming soon — run the app locally with Docker Compose to see it in action._

---

## License

This project is licensed under the [MIT License](LICENSE).
