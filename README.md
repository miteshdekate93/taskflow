# Taskflow — Task Manager App

![CI](https://github.com/miteshdekate93/taskflow/actions/workflows/ci-cd.yml/badge.svg)
![.NET 8](https://img.shields.io/badge/.NET-8-purple)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED)

A full-stack task management app built to demonstrate end-to-end development skills — .NET 8 REST API backend, React + TypeScript frontend, all running in Docker.

## What It Does

Users can register, log in, and manage their tasks (create, complete, delete). Everything is secured with JWT authentication.

## Tech Stack

| Part | Technology |
|------|-----------|
| Backend | .NET 8 Web API (minimal API) |
| Database | PostgreSQL + Entity Framework Core |
| Auth | JWT Bearer tokens + BCrypt |
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + React Query |
| Container | Docker + Docker Compose |
| CI | GitHub Actions |

## Run It Locally

**One command with Docker:**
```bash
git clone https://github.com/miteshdekate93/taskflow.git
cd taskflow
docker-compose up --build
```
- App: http://localhost:3000
- API + Swagger docs: http://localhost:5000/swagger

**Without Docker:**
```bash
# Backend
cd backend && dotnet run

# Frontend (new terminal)
cd frontend && npm install && npm run dev
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, get JWT token |
| GET | `/api/tasks` | Get your tasks |
| POST | `/api/tasks` | Create a task |
| PUT | `/api/tasks/{id}` | Update a task |
| DELETE | `/api/tasks/{id}` | Delete a task |

## Project Structure

```
taskflow/
├── backend/    .NET 8 API (JWT auth, EF Core, PostgreSQL)
├── frontend/   React 18 + TypeScript (Vite, Tailwind, React Query)
└── docker-compose.yml
```
