# AI Project & Task Manager — REST API Documentation

This document provides a comprehensive technical reference for the REST API developed in **Task 2**.

---

## 1. Overview & Architecture

The backend is built with **Node.js** and **Express.js** following a clean, modular architecture:

```
Client Request
  ↓
Express Route (/routes/*)
  ↓
Validation Middleware (/middleware/validationMiddleware.js)
  ↓
Controller Logic (/controllers/*)
  ↓
JSON Response
```

When an error occurs:
```
Controller / Validation Middleware
  ↓
next(new AppError(message, statusCode))
  ↓
Centralized Error Middleware (/middleware/errorMiddleware.js)
  ↓
Uniform JSON Error Response
```

### Server Configuration & Environment
- **Default Port**: `5000` (configurable via `PORT` in `.env`)
- **Base URL**: `http://localhost:5000`
- **Data Serialization**: JSON (`Content-Type: application/json`)
- **Current Persistence**: Persistent MySQL database (`ai_project_task_manager`) via `mysql2/promise` connection pool.

---

## 2. Standard Response Envelopes

Every endpoint in this API responds with a consistent JSON envelope.

### Success Response Format
```json
{
  "success": true,
  "message": "Human-readable success description",
  "data": {}
}
```

### Error Response Format
```json
{
  "success": false,
  "message": "Human-readable error description"
}
```

---

## 3. HTTP Status Codes

| Status Code | Meaning | Usage in This API |
|:---|:---|:---|
| **`200 OK`** | Request succeeded | Standard response for successful `GET`, `PUT`, `PATCH`, and `DELETE` requests. |
| **`201 Created`** | Resource created | Returned by `POST /api/users`, `POST /api/projects`, and `POST /api/tasks` when a new record is saved. |
| **`400 Bad Request`** | Client data error | Returned by validation middleware when required fields are missing, empty, or have invalid formats/types. Also returned if clients attempt illegal mutations (e.g. changing `userId` on projects or `projectId` on tasks). |
| **`404 Not Found`** | Resource does not exist | Returned when a requested entity ID does not exist in the database, or when an associated parent foreign reference (`userId` or `projectId`) cannot be located. |
| **`409 Conflict`** | Business logic conflict | Returned when attempting to register or update a user with an email address already assigned to another user. |
| **`500 Internal Server Error`** | Unhandled server error | Handled centrally by `errorMiddleware.js`. Prevents internal stack traces from leaking to client responses in production mode. |

---

## 4. Data Models & Entity Relationships

The API models a 3-tier hierarchical relationship:

```
┌──────────────┐
│    Users     │
└──────┬───────┘
       │ 1-to-Many (userId)
       ▼
┌──────────────┐
│   Projects   │
└──────┬───────┘
       │ 1-to-Many (projectId)
       ▼
┌──────────────┐
│    Tasks     │
└──────────────┘
```

### Entity Schemas

#### User Schema
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2026-09-05T09:22:28.027Z"
}
```

#### Project Schema
```json
{
  "id": 1,
  "name": "AI Project & Task Manager",
  "description": "Full stack application for managing projects and tasks",
  "userId": 1,
  "status": "active",
  "priority": "high",
  "createdAt": "2026-09-05T09:25:46.497Z",
  "updatedAt": "2026-09-05T09:25:46.497Z"
}
```
- **Allowed `status` values**: `'planning'`, `'active'`, `'completed'` (Default: `'planning'`)
- **Allowed `priority` values**: `'low'`, `'medium'`, `'high'` (Default: `'medium'`)

#### Task Schema
```json
{
  "id": 1,
  "title": "Build Task API",
  "description": "Create REST API endpoints for task management",
  "projectId": 1,
  "status": "todo",
  "priority": "high",
  "dueDate": "2026-10-01",
  "createdAt": "2026-09-05T09:28:10.123Z",
  "updatedAt": "2026-09-05T09:28:10.123Z"
}
```
- **Allowed `status` values**: `'todo'`, `'in-progress'`, `'done'` (Default: `'todo'`)
- **Allowed `priority` values**: `'low'`, `'medium'`, `'high'` (Default: `'medium'`)
- **`dueDate`**: Optional ISO or `YYYY-MM-DD` date string.

### Relationship Enforcement
- When creating a **Project**, `userId` is validated against the MySQL `users` table. If not found, `404 Not Found` is returned.
- When creating a **Task**, `projectId` is validated against the MySQL `projects` table. If not found, `404 Not Found` is returned.
- Relational foreign keys in MySQL (`fk_projects_user` and `fk_tasks_project`) enforce referential integrity with `ON DELETE CASCADE`.

---

## 5. Endpoints Reference

### 5.1 Base Endpoints

#### `GET /`
- **Purpose**: Verify that the Express server process is running.
- **Success (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "AI Project & Task Manager API is running"
  }
  ```

#### `GET /api/health`
- **Purpose**: DevOps and container health inspection.
- **Success (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "API is healthy"
  }
  ```

---

### 5.2 Users API (`/api/users`)

#### `GET /api/users`
- **Purpose**: Retrieve all users in the system.
- **Success (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Users retrieved successfully",
    "data": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "createdAt": "2026-09-05T09:22:28.027Z"
      }
    ]
  }
  ```

#### `GET /api/users/:id`
- **Purpose**: Retrieve a single user by ID.
- **Success (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "User retrieved successfully",
    "data": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2026-09-05T09:22:28.027Z"
    }
  }
  ```
- **Error (`404 Not Found`)**:
  ```json
  {
    "success": false,
    "message": "User with id 999 not found"
  }
  ```

#### `POST /api/users`
- **Purpose**: Register a new user.
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com"
  }
  ```
- **Success (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "User created successfully",
    "data": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2026-09-05T09:22:28.027Z"
    }
  }
  ```
- **Error (`400 Bad Request`)** — Missing name:
  ```json
  {
    "success": false,
    "message": "Name is required and cannot be empty"
  }
  ```
- **Error (`400 Bad Request`)** — Invalid email format:
  ```json
  {
    "success": false,
    "message": "Please provide a valid email address (e.g. user@example.com)"
  }
  ```
- **Error (`409 Conflict`)** — Duplicate email:
  ```json
  {
    "success": false,
    "message": "A user with email \"john@example.com\" already exists"
  }
  ```

#### `PUT /api/users/:id`
- **Purpose**: Update an existing user's details (`name`, `email`).
- **Request Body**:
  ```json
  {
    "name": "John Updated",
    "email": "johnupdated@example.com"
  }
  ```
- **Success (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "User updated successfully",
    "data": {
      "id": 1,
      "name": "John Updated",
      "email": "johnupdated@example.com",
      "createdAt": "2026-09-05T09:22:28.027Z"
    }
  }
  ```
- **Error (`404 Not Found`)**:
  ```json
  {
    "success": false,
    "message": "User with id 999 not found"
  }
  ```
- **Error (`409 Conflict`)**: Email belongs to another existing user.

#### `DELETE /api/users/:id`
- **Purpose**: Remove a user from the system.
- **Success (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "User deleted successfully",
    "data": {
      "id": 1,
      "name": "John Updated",
      "email": "johnupdated@example.com",
      "createdAt": "2026-09-05T09:22:28.027Z"
    }
  }
  ```
- **Error (`404 Not Found`)**:
  ```json
  {
    "success": false,
    "message": "User with id 999 not found"
  }
  ```

---

### 5.3 Projects API (`/api/projects`)

#### `GET /api/projects`
- **Purpose**: Retrieve all projects.
- **Query Parameters**:
  - `userId` *(optional)*: Integer ID to filter projects belonging exclusively to a specific user.
- **Example**: `GET /api/projects?userId=1`
- **Success (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Projects retrieved successfully",
    "data": [
      {
        "id": 1,
        "name": "AI Project & Task Manager",
        "description": "A full stack application for managing projects and tasks with AI assistance",
        "userId": 1,
        "status": "active",
        "priority": "high",
        "createdAt": "2026-09-05T09:25:46.497Z",
        "updatedAt": "2026-09-05T09:25:46.497Z"
      }
    ]
  }
  ```

#### `GET /api/projects/:id`
- **Purpose**: Retrieve a single project by ID.
- **Success (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Project retrieved successfully",
    "data": {
      "id": 1,
      "name": "AI Project & Task Manager",
      "description": "A full stack application for managing projects and tasks with AI assistance",
      "userId": 1,
      "status": "active",
      "priority": "high",
      "createdAt": "2026-09-05T09:25:46.497Z",
      "updatedAt": "2026-09-05T09:25:46.497Z"
    }
  }
  ```
- **Error (`404 Not Found`)**:
  ```json
  {
    "success": false,
    "message": "Project with id 999 not found"
  }
  ```

#### `POST /api/projects`
- **Purpose**: Create a new project for a user.
- **Request Body**:
  ```json
  {
    "name": "AI Project & Task Manager",
    "description": "A full stack application for managing projects and tasks with AI assistance",
    "userId": 1,
    "status": "active",
    "priority": "high"
  }
  ```
- **Success (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Project created successfully",
    "data": {
      "id": 1,
      "name": "AI Project & Task Manager",
      "description": "A full stack application for managing projects and tasks with AI assistance",
      "userId": 1,
      "status": "active",
      "priority": "high",
      "createdAt": "2026-09-05T09:25:46.497Z",
      "updatedAt": "2026-09-05T09:25:46.497Z"
    }
  }
  ```
- **Error (`400 Bad Request`)** — Missing required fields:
  ```json
  {
    "success": false,
    "message": "Project name is required and cannot be empty"
  }
  ```
- **Error (`400 Bad Request`)** — Invalid enum:
  ```json
  {
    "success": false,
    "message": "Invalid status. Allowed values are: planning, active, completed"
  }
  ```
- **Error (`404 Not Found`)** — Non-existent user reference:
  ```json
  {
    "success": false,
    "message": "User with id 999 not found"
  }
  ```

#### `PUT /api/projects/:id`
- **Purpose**: Update project details (`name`, `description`, `status`, `priority`).
- **Restrictions**: Changing `userId` is strictly disallowed.
- **Request Body**:
  ```json
  {
    "name": "AI Project Manager Updated",
    "status": "completed",
    "priority": "medium"
  }
  ```
- **Success (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Project updated successfully",
    "data": {
      "id": 1,
      "name": "AI Project Manager Updated",
      "description": "A full stack application for managing projects and tasks with AI assistance",
      "userId": 1,
      "status": "completed",
      "priority": "medium",
      "createdAt": "2026-09-05T09:25:46.497Z",
      "updatedAt": "2026-09-05T09:25:46.525Z"
    }
  }
  ```
- **Error (`404 Not Found`)**:
  ```json
  {
    "success": false,
    "message": "Project with id 999 not found"
  }
  ```

#### `DELETE /api/projects/:id`
- **Purpose**: Delete a project by ID.
- **Success (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Project deleted successfully",
    "data": {
      "id": 1,
      "name": "AI Project Manager Updated",
      "description": "A full stack application for managing projects and tasks with AI assistance",
      "userId": 1,
      "status": "completed",
      "priority": "medium",
      "createdAt": "2026-09-05T09:25:46.497Z",
      "updatedAt": "2026-09-05T09:25:46.525Z"
    }
  }
  ```
- **Error (`404 Not Found`)**:
  ```json
  {
    "success": false,
    "message": "Project with id 999 not found"
  }
  ```

---

### 5.4 Tasks API (`/api/tasks`)

#### `GET /api/tasks`
- **Purpose**: Retrieve all tasks with optional multi-criteria filtering.
- **Query Parameters**:
  - `projectId` *(optional)*: Filter by parent project ID.
  - `status` *(optional)*: Filter by status (`todo`, `in-progress`, `done`).
- **Examples**:
  - `GET /api/tasks?projectId=1`
  - `GET /api/tasks?status=todo`
  - `GET /api/tasks?projectId=1&status=todo`
- **Success (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Tasks retrieved successfully",
    "data": [
      {
        "id": 1,
        "title": "Build Task API",
        "description": "Create REST API endpoints for task management",
        "projectId": 1,
        "status": "todo",
        "priority": "high",
        "dueDate": "2026-10-01",
        "createdAt": "2026-09-05T09:28:10.123Z",
        "updatedAt": "2026-09-05T09:28:10.123Z"
      }
    ]
  }
  ```

#### `GET /api/tasks/:id`
- **Purpose**: Retrieve a single task by ID.
- **Success (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Task retrieved successfully",
    "data": {
      "id": 1,
      "title": "Build Task API",
      "description": "Create REST API endpoints for task management",
      "projectId": 1,
      "status": "todo",
      "priority": "high",
      "dueDate": "2026-10-01",
      "createdAt": "2026-09-05T09:28:10.123Z",
      "updatedAt": "2026-09-05T09:28:10.123Z"
    }
  }
  ```
- **Error (`404 Not Found`)**:
  ```json
  {
    "success": false,
    "message": "Task with id 999 not found"
  }
  ```

#### `POST /api/tasks`
- **Purpose**: Create a new task under a project.
- **Request Body**:
  ```json
  {
    "title": "Build Task API",
    "description": "Create REST API endpoints for task management",
    "projectId": 1,
    "status": "todo",
    "priority": "high",
    "dueDate": "2026-10-01"
  }
  ```
- **Success (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Task created successfully",
    "data": {
      "id": 1,
      "title": "Build Task API",
      "description": "Create REST API endpoints for task management",
      "projectId": 1,
      "status": "todo",
      "priority": "high",
      "dueDate": "2026-10-01",
      "createdAt": "2026-09-05T09:28:10.123Z",
      "updatedAt": "2026-09-05T09:28:10.123Z"
    }
  }
  ```
- **Error (`400 Bad Request`)** — Missing title:
  ```json
  {
    "success": false,
    "message": "Task title is required and cannot be empty"
  }
  ```
- **Error (`404 Not Found`)** — Non-existing parent project:
  ```json
  {
    "success": false,
    "message": "Project with id 999 not found"
  }
  ```

#### `PUT /api/tasks/:id`
- **Purpose**: Update task fields (`title`, `description`, `status`, `priority`, `dueDate`).
- **Restrictions**: Changing `projectId` is strictly disallowed.
- **Request Body**:
  ```json
  {
    "title": "Build Complete Task API",
    "status": "in-progress",
    "priority": "high"
  }
  ```
- **Success (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Task updated successfully",
    "data": {
      "id": 1,
      "title": "Build Complete Task API",
      "description": "Create REST API endpoints for task management",
      "projectId": 1,
      "status": "in-progress",
      "priority": "high",
      "dueDate": "2026-10-01",
      "createdAt": "2026-09-05T09:28:10.123Z",
      "updatedAt": "2026-09-05T09:28:10.160Z"
    }
  }
  ```
- **Error (`404 Not Found`)**:
  ```json
  {
    "success": false,
    "message": "Task with id 999 not found"
  }
  ```

#### `PATCH /api/tasks/:id/status`
- **Purpose**: Dedicated, lightweight endpoint to transition task workflow status.
- **Allowed Values**: `'todo'`, `'in-progress'`, `'done'`
- **Request Body**:
  ```json
  {
    "status": "done"
  }
  ```
- **Success (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Task status updated successfully",
    "data": {
      "id": 1,
      "title": "Build Complete Task API",
      "description": "Create REST API endpoints for task management",
      "projectId": 1,
      "status": "done",
      "priority": "high",
      "dueDate": "2026-10-01",
      "createdAt": "2026-09-05T09:28:10.123Z",
      "updatedAt": "2026-09-05T09:28:10.180Z"
    }
  }
  ```
- **Error (`400 Bad Request`)** — Invalid status value:
  ```json
  {
    "success": false,
    "message": "Invalid status. Allowed values are: todo, in-progress, done"
  }
  ```
- **Error (`404 Not Found`)**:
  ```json
  {
    "success": false,
    "message": "Task with id 999 not found"
  }
  ```

#### `DELETE /api/tasks/:id`
- **Purpose**: Remove a task by ID.
- **Success (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Task deleted successfully",
    "data": {
      "id": 1,
      "title": "Build Complete Task API",
      "description": "Create REST API endpoints for task management",
      "projectId": 1,
      "status": "done",
      "priority": "high",
      "dueDate": "2026-10-01",
      "createdAt": "2026-09-05T09:28:10.123Z",
      "updatedAt": "2026-09-05T09:28:10.180Z"
    }
  }
  ```
- **Error (`404 Not Found`)**:
  ```json
  {
    "success": false,
    "message": "Task with id 999 not found"
  }
  ```
