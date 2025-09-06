# Task Management App

A full-stack task management application with real-time updates, user authentication, and task organization features.

## Project Description

Task Management App is a modern web application designed to help users organize and track their tasks efficiently. The application provides a user-friendly interface for creating, updating, and managing tasks with various categorization options.

### Features

- **User Authentication**: Secure registration and login system
- **Task Management**: Create, read, update, and delete tasks
- **Task Organization**: Categorize tasks by status, priority, and category
- **Real-time Updates**: Instant task updates using WebSocket connections
- **Responsive Design**: Works on desktop and mobile devices
- **API Rate Limiting**: Protection against abuse
- **Token-based Authentication**: Secure API access with JWT

## Technologies Used

### Backend

- **Node.js** with **Express.js** framework
- **TypeScript** for type safety
- **PostgreSQL** database
- **Prisma ORM** for database operations
- **Socket.IO** for real-time communication
- **JWT** for authentication
- **Zod** for input validation
- **Winston** for logging

### Frontend

- **React** (v19) with hooks
- **TypeScript** for type safety
- **Vite** as build tool
- **React Router** for navigation
- **Axios** for API requests
- **Socket.IO Client** for real-time updates
- **React Hot Toast** for notifications
- **CSS** for styling

## Installation and Setup

### Prerequisites

- Node.js (v16 or later)
- PostgreSQL database
- npm or yarn

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/1ammer/task-management-app.git
   cd task-management-app/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/taskmanagement"
   
   # Server
   PORT=4000
   NODE_ENV=development
   API_PREFIX="/api/v1"
   
   # JWT
   JWT_SECRET="your-jwt-secret"
   JWT_EXPIRES_IN=15m
   REFRESH_TOKEN_EXPIRES_IN=7d
   ```

4. Set up the database:
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend directory:
   ```
   VITE_API_URL=http://localhost:4000/api/v1
   VITE_API_BASE_URL=http://localhost:4000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

### Backend

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `PORT` | Server port | 4000 |
| `NODE_ENV` | Environment (development/production) | development |
| `API_PREFIX` | API route prefix | /api/v1 |
| `JWT_SECRET` | Secret for JWT signing | - |
| `JWT_ACCESS_EXPIRATION` | Access token expiration time | 15m |
| `JWT_REFRESH_EXPIRATION` | Refresh token expiration time | 7d |

### Frontend

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | http://localhost:4000/api/v1 |
| `VITE_API_BASE_URL` | Backend base URL | http://localhost:4000 |

## API Endpoints Documentation

### Authentication

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|-------------|----------|
| `POST` | `/api/v1/auth/register` | Register a new user | `{ email, password, name? }` | User data with tokens |
| `POST` | `/api/v1/auth/login` | Login a user | `{ email, password }` | User data with tokens |
| `POST` | `/api/v1/auth/refresh-token` | Refresh access token | `{ refreshToken }` | New access and refresh tokens |
| `GET` | `/api/v1/auth/me` | Get current user info | - | User data |

### Tasks

| Method | Endpoint | Description | Request Body/Params | Response |
|--------|----------|-------------|-------------|----------|
| `GET` | `/api/v1/tasks` | Get all tasks | Query params for filtering | Array of tasks |
| `GET` | `/api/v1/tasks/:id` | Get a specific task | Task ID in URL | Task data |
| `POST` | `/api/v1/tasks` | Create a new task | `{ title, description?, category, status?, priority? }` | Created task |
| `PATCH` | `/api/v1/tasks/:id` | Update a task | `{ title?, description?, category?, status?, priority?, completed? }` | Updated task |
| `DELETE` | `/api/v1/tasks/:id` | Delete a task | Task ID in URL | Success message |

### Task Categories

Tasks can be categorized by:
- **Category**: WORK, PERSONAL, STUDY, HEALTH, OTHER
- **Status**: TODO, IN_PROGRESS, DONE
- **Priority**: LOW, MEDIUM, HIGH

### Health Check

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| `GET` | `/health` | Check API health | `{ status: "ok" }` |

## License

This project is licensed under the ISC License. 