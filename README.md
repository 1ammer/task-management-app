# Task Management App

A full-stack task management application with real-time updates, user authentication, dark/light mode, and advanced task organization features.

## Project Description

Task Management App is a modern web application designed to help users organize and track their tasks efficiently. The application provides a user-friendly interface for creating, updating, and managing tasks with various categorization options, due dates, progress tracking, and real-time collaboration.

### Features

- **User Authentication**: Secure registration and login system with JWT
- **Task Management**: Create, read, update, and delete tasks
- **Advanced Task Organization**: 
  - Categorize tasks by status, priority, and category
  - Set due dates with custom date picker
  - Track progress with visual progress bars
  - Search and filter tasks
  - Sort by creation date, title, or due date
- **Real-time Updates**: Instant task updates using WebSocket connections
- **Dark/Light Mode**: Toggle between themes with persistent preferences
- **Responsive Design**: Works on desktop and mobile devices
- **API Rate Limiting**: Protection against abuse
- **Input Validation**: Comprehensive Zod validation for all API endpoints
- **Type Safety**: Full TypeScript support throughout the application

## Technologies Used

### Backend

- **Node.js** with **Express.js** framework
- **TypeScript** for type safety
- **PostgreSQL** database
- **Prisma ORM** for database operations
- **Socket.IO** for real-time communication
- **JWT** for authentication
- **Zod** for input validation and response validation
- **Winston** for logging
- **Helmet** for security headers
- **CORS** for cross-origin requests
- **Express Rate Limit** for API protection
- **Morgan** for HTTP request logging

### Frontend

- **React** (v19) with hooks
- **TypeScript** for type safety
- **Vite** as build tool
- **React Router** for navigation
- **Axios** for API requests
- **Socket.IO Client** for real-time updates
- **React Hot Toast** for notifications
- **Custom CSS** with CSS variables for theming
- **Context API** for state management

## Quick Start

### Prerequisites

- Node.js (v16 or later)
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/1ammer/task-management-app.git
   cd task-management-app
   ```

#### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your database credentials:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/task_management_db"
   JWT_SECRET="your-super-secret-jwt-key-change-in-production-12345"
   JWT_EXPIRES_IN="1h"
   REFRESH_TOKEN_EXPIRES_IN="7d"
   PORT=4000
   NODE_ENV="development"
   FRONTEND_URL="http://localhost:5173"
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

#### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```env
   VITE_API_URL=http://localhost:4000/api/v1
   VITE_SOCKET_URL=http://localhost:4000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000

## Database Setup

### Install PostgreSQL

#### macOS
```bash
# Using Homebrew
brew install postgresql
brew services start postgresql
createdb task_management_db

# Or using PostgreSQL.app
# Download from https://postgresapp.com/
# Start the app and create database via GUI
```

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres createdb task_management_db
```

#### Windows
1. Download from https://www.postgresql.org/download/windows/
2. Install with default settings
3. Create database using pgAdmin or psql command line

## Environment Variables

### Backend

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `PORT` | Server port | 4000 |
| `NODE_ENV` | Environment (development/production) | development |
| `JWT_SECRET` | Secret for JWT signing | - |
| `JWT_EXPIRES_IN` | JWT token expiration time | 1h |
| `REFRESH_TOKEN_EXPIRES_IN` | Refresh token expiration time | 7d |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:5173 |

### Frontend

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | http://localhost:4000/api/v1 |
| `VITE_SOCKET_URL` | Backend base URL | http://localhost:4000 |

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
| `GET` | `/api/v1/tasks` | Get all tasks | Query params: `search`, `category`, `sortBy`, `sortOrder` | Array of tasks |
| `GET` | `/api/v1/tasks/:id` | Get a specific task | Task ID in URL | Task data |
| `POST` | `/api/v1/tasks` | Create a new task | `{ title, description?, category, status?, priority?, dueDate?, progress? }` | Created task |
| `PATCH` | `/api/v1/tasks/:id` | Update a task | `{ title?, description?, category?, status?, priority?, completed?, dueDate?, progress? }` | Updated task |
| `DELETE` | `/api/v1/tasks/:id` | Delete a task | Task ID in URL | Success message |

### Task Categories

Tasks can be categorized by:
- **Category**: WORK, PERSONAL, STUDY, HEALTH, OTHER
- **Status**: TODO, IN_PROGRESS, DONE
- **Priority**: LOW, MEDIUM, HIGH

### Task Features

- **Due Dates**: Set due dates with custom date picker (date-only)
- **Progress Tracking**: Visual progress bars (0-100%)
- **Search & Filter**: Search by title/description, filter by category
- **Sorting**: Sort by creation date, title, or due date (ascending/descending)
- **Real-time Updates**: Live updates via WebSocket when tasks are modified

### Health Check

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| `GET` | `/health` | Check API health | `{ status: "ok" }` |

## Recent Updates

### ✨ New Features Added

- **Dark/Light Mode**: Toggle between themes with persistent user preferences
- **Custom Date Picker**: Date-only picker for setting task due dates
- **Progress Tracking**: Visual progress bars with 0-100% completion tracking
- **Enhanced Task Management**: 
  - Due date support with contextual display (overdue, due today, etc.)
  - Progress indicators with color-coded completion levels
  - Advanced search and filtering capabilities
  - Multiple sorting options (by date, title, due date)
- **Improved UI/UX**:
  - Responsive design with mobile-first approach
  - Consistent theming across all components
  - Better form layouts with 50-50 width distribution
  - Enhanced visual feedback and loading states


## Development

### Available Scripts

#### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Prisma Studio

#### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## License

This project is licensed under the ISC License. 