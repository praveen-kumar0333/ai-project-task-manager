# Database Documentation: AI Project & Task Manager

This document provides a comprehensive technical overview of the MySQL relational database architecture implemented in **Task 3** for the AI Project & Task Manager backend.

---

## 1. Database Overview

- **Database Name**: `ai_project_task_manager`
- **Database Engine**: MySQL 8.0+ / MariaDB 10.11+
- **Storage Engine**: `InnoDB` (ACID-compliant, supporting row-level locking, foreign key constraints, and crash recovery via redo/undo logging)
- **Character Set**: `utf8mb4`
- **Collation**: `utf8mb4_unicode_ci`

---

## 2. Technology & Driver

- **Runtime**: Node.js
- **Driver**: `mysql2/promise` (Version `^3.x`)
- **Connection Approach**: Reusable connection pool configured in `server/config/db.js`.
  - Pooled connections eliminate per-request TCP handshakes.
  - Idle connections are automatically released back to the pool after query completion.
  - Supports non-blocking Promises via `async/await`.
  - Native support for prepared statements and parameterized queries via `pool.execute()`.

---

## 3. Database Architecture & Relationships

The database models a strict three-tier hierarchical entity relationship:

```
┌──────────────────────────────────────┐
│                USERS                 │
│  - id (PK, INT AUTO_INCREMENT)       │
│  - name VARCHAR(100) NOT NULL        │
│  - email VARCHAR(191) NOT NULL UNIQUE│
│  - created_at TIMESTAMP              │
│  - updated_at TIMESTAMP              │
└──────────────────┬───────────────────┘
                   │
                   │ 1 : N (One User owns Many Projects)
                   │ ON DELETE CASCADE
                   ▼
┌──────────────────────────────────────┐
│               PROJECTS               │
│  - id (PK, INT AUTO_INCREMENT)       │
│  - name VARCHAR(150) NOT NULL        │
│  - description TEXT NOT NULL         │
│  - user_id INT NOT NULL (FK)         │
│  - status ENUM(...) NOT NULL         │
│  - priority ENUM(...) NOT NULL       │
│  - created_at TIMESTAMP              │
│  - updated_at TIMESTAMP              │
└──────────────────┬───────────────────┘
                   │
                   │ 1 : N (One Project contains Many Tasks)
                   │ ON DELETE CASCADE
                   ▼
┌──────────────────────────────────────┐
│                TASKS                 │
│  - id (PK, INT AUTO_INCREMENT)       │
│  - title VARCHAR(255) NOT NULL       │
│  - description TEXT NOT NULL         │
│  - project_id INT NOT NULL (FK)      │
│  - status ENUM(...) NOT NULL         │
│  - priority ENUM(...) NOT NULL       │
│  - due_date DATE NULL                │
│  - created_at TIMESTAMP              │
│  - updated_at TIMESTAMP              │
└──────────────────────────────────────┘
```

---

## 4. Tables & Column Specifications

### 4.1 `users` Table
Stores registered users.

| Column | Data Type | Nullable | Default | Constraints / Attributes | Description |
|:---|:---|:---:|:---|:---|:---|
| `id` | `INT` | No | Auto-increment | `PRIMARY KEY` | Unique identifier for each user |
| `name` | `VARCHAR(100)` | No | None | None | Full display name of the user |
| `email` | `VARCHAR(191)` | No | None | `UNIQUE KEY uq_users_email` | Unique email address |
| `created_at` | `TIMESTAMP` | No | `CURRENT_TIMESTAMP` | None | Record creation timestamp |
| `updated_at` | `TIMESTAMP` | No | `CURRENT_TIMESTAMP` | `ON UPDATE CURRENT_TIMESTAMP` | Automatic update timestamp |

### 4.2 `projects` Table
Stores projects managed by users.

| Column | Data Type | Nullable | Default | Constraints / Attributes | Description |
|:---|:---|:---:|:---|:---|:---|
| `id` | `INT` | No | Auto-increment | `PRIMARY KEY` | Unique identifier for each project |
| `name` | `VARCHAR(150)` | No | None | None | Descriptive project name |
| `description` | `TEXT` | No | None | None | Detailed project overview |
| `user_id` | `INT` | No | None | `FOREIGN KEY` (references `users.id`) | Foreign key linking project to owner |
| `status` | `ENUM('planning', 'active', 'completed')` | No | `'planning'` | None | Current project lifecycle status |
| `priority` | `ENUM('low', 'medium', 'high')` | No | `'medium'` | None | Project urgency/priority level |
| `created_at` | `TIMESTAMP` | No | `CURRENT_TIMESTAMP` | None | Record creation timestamp |
| `updated_at` | `TIMESTAMP` | No | `CURRENT_TIMESTAMP` | `ON UPDATE CURRENT_TIMESTAMP` | Automatic update timestamp |

### 4.3 `tasks` Table
Stores actionable tasks assigned under projects.

| Column | Data Type | Nullable | Default | Constraints / Attributes | Description |
|:---|:---|:---:|:---|:---|:---|
| `id` | `INT` | No | Auto-increment | `PRIMARY KEY` | Unique identifier for each task |
| `title` | `VARCHAR(255)` | No | None | None | Task title or subject |
| `description` | `TEXT` | No | None | None | Detailed description of the task |
| `project_id` | `INT` | No | None | `FOREIGN KEY` (references `projects.id`) | Foreign key linking task to project |
| `status` | `ENUM('todo', 'in-progress', 'done')` | No | `'todo'` | None | Current task progress state |
| `priority` | `ENUM('low', 'medium', 'high')` | No | `'medium'` | None | Task priority level |
| `due_date` | `DATE` | Yes | `NULL` | None | Optional calendar deadline (`YYYY-MM-DD`) |
| `created_at` | `TIMESTAMP` | No | `CURRENT_TIMESTAMP` | None | Record creation timestamp |
| `updated_at` | `TIMESTAMP` | No | `CURRENT_TIMESTAMP` | `ON UPDATE CURRENT_TIMESTAMP` | Automatic update timestamp |

---

## 5. Primary Keys & Foreign Keys

### Primary Keys
- `users.id`: Unique clustered index for fast row retrieval by user ID.
- `projects.id`: Unique clustered index for fast row retrieval by project ID.
- `tasks.id`: Unique clustered index for fast row retrieval by task ID.

### Foreign Keys
1. **`fk_projects_user`**:
   ```sql
   CONSTRAINT fk_projects_user
     FOREIGN KEY (user_id) REFERENCES users(id)
     ON DELETE CASCADE
     ON UPDATE CASCADE
   ```
   Ensures that every project references a valid row in `users`.
2. **`fk_tasks_project`**:
   ```sql
   CONSTRAINT fk_tasks_project
     FOREIGN KEY (project_id) REFERENCES projects(id)
     ON DELETE CASCADE
     ON UPDATE CASCADE
   ```
   Ensures that every task references a valid row in `projects`.

---

## 6. ON DELETE CASCADE Behavior

The database schema strictly implements `ON DELETE CASCADE` on all foreign key constraints:

1. **When a Project is deleted (`DELETE FROM projects WHERE id = ?`)**:
   - MySQL's InnoDB storage engine automatically deletes all tasks whose `project_id` matches the deleted project's `id`.
   - No dangling or orphaned task records can remain.
2. **When a User is deleted (`DELETE FROM users WHERE id = ?`)**:
   - MySQL automatically deletes all projects whose `user_id` matches the deleted user's `id`.
   - Because `fk_tasks_project` also specifies `ON DELETE CASCADE`, deleting those projects triggers a secondary cascade that deletes all tasks within those projects.
   - The entire branch of the hierarchy is cleaned up atomically by the database engine in a single transaction.

---

## 7. Required Environment Variables

The MySQL connection configuration is managed through environment variables loaded via `dotenv` in `server/config/db.js`:

| Variable | Description | Default / Example Value |
|:---|:---|:---|
| `DB_HOST` | Hostname or IP address of the MySQL server | `localhost` |
| `DB_PORT` | Port number on which MySQL listens | `3306` |
| `DB_USER` | MySQL database user with read/write privileges | `taskuser` |
| `DB_PASSWORD` | Password for the MySQL user | `taskpassword` |
| `DB_NAME` | Name of the database schema | `ai_project_task_manager` |

These are declared in `.env` and documented in `.env.example`.

---

## 8. Database Initialization

The database schema definition is preserved in `server/database/schema.sql`.

### To initialize or reset the database:
```bash
# 1. Connect to MySQL as root and execute schema.sql
mysql -u root -p < server/database/schema.sql

# 2. (Optional) Grant privileges to the application user
mysql -u root -p -e "
  CREATE USER IF NOT EXISTS 'taskuser'@'localhost' IDENTIFIED BY 'taskpassword';
  GRANT ALL PRIVILEGES ON ai_project_task_manager.* TO 'taskuser'@'localhost';
  FLUSH PRIVILEGES;
"
```

The script is idempotent:
- It creates the database with `CREATE DATABASE IF NOT EXISTS`.
- It creates each table with `CREATE TABLE IF NOT EXISTS`.
- It can be run safely against an existing installation without corrupting existing tables if they already exist.

---

## 9. How Node.js Connects to MySQL

In `server/config/db.js`, connection pooling is configured as follows:

```javascript
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'taskuser',
  password: process.env.DB_PASSWORD || 'taskpassword',
  database: process.env.DB_NAME || 'ai_project_task_manager',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: 'Z'
});

async function testConnection() {
  const connection = await pool.getConnection();
  connection.release();
}
```

- When the Express server boots in `server/server.js`, `testConnection()` is called during startup to verify database reachability before accepting client HTTP traffic.
- If the database is down or credentials are incorrect, a descriptive error message is logged to `console.error` and the server process exits gracefully (`process.exit(1)`).

---

## 10. Data Persistence Mechanics

1. **Disk Persistence**:
   Unlike in-memory variables which reside in ephemeral Node.js process heap memory, MySQL writes all commits to disk using the InnoDB storage engine:
   - Data modifications are immediately appended to InnoDB write-ahead redo logs.
   - Tablespace pages (`.ibd` files) are written to persistent container storage.
   - Data survives Node.js server restarts, process crashes, and deployments.
2. **ACID Compliance**:
   - **Atomicity**: Changes succeed completely or roll back.
   - **Consistency**: Unique constraints (e.g. `users.email`) and foreign keys prevent invalid states.
   - **Isolation**: Concurrent HTTP requests cannot read uncommitted mutations.
   - **Durability**: Committed data survives system failures.
3. **Prepared Statements & SQL Injection Defense**:
   All database interactions in controllers utilize `pool.execute(sql, [params])`:
   - SQL structure and data payloads are transmitted separately over the MySQL protocol.
   - Malicious user inputs containing quotes, semicolons, or SQL commands are treated strictly as string literals, preventing SQL injection (SQLi).
