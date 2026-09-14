/**
 * Safe Database Initialization Script for Production & Development
 *
 * Designed for Aiven MySQL and other managed MySQL instances.
 * - Idempotent (uses CREATE TABLE IF NOT EXISTS / ADD COLUMN IF NOT EXISTS).
 * - Non-destructive (no DROP TABLE, no TRUNCATE, no DELETE).
 * - Executes in strictly verified foreign-key dependency order.
 * - Supports SSL/TLS required by Aiven MySQL.
 * - Uses environment variables only; never contains credentials.
 */

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables from server/.env if available
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function initDatabase() {
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT, 10) || 3306;
  const user = process.env.DB_USER || 'taskuser';
  const password = process.env.DB_PASSWORD || 'taskpassword';
  const database = process.env.DB_NAME || 'ai_project_task_manager';

  console.log('===========================================================');
  console.log(' AI Project & Task Manager — Database Initializer');
  console.log('===========================================================');
  console.log(`Connecting to: ${user}@${host}:${port}/${database}`);

  const sslMode = (process.env.DB_SSL || process.env.MYSQL_SSL || '').toLowerCase();
  const isAiven = Boolean(host && host.includes('aivencloud.com'));
  let ssl = undefined;

  if (sslMode === 'true' || sslMode === '1' || sslMode === 'required' || sslMode === 'require' || isAiven) {
    ssl = {
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true'
    };
    if (process.env.DB_SSL_CA) {
      ssl.ca = process.env.DB_SSL_CA;
    }
    console.log('SSL Mode: ENABLED (Aiven / Managed MySQL compatible)');
  } else {
    console.log('SSL Mode: Disabled (local connection)');
  }

  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
    multipleStatements: true,
    ...(ssl ? { ssl } : {})
  });

  try {
    console.log('Database connection established successfully.\n');

    // Schema definitions in strict dependency order:
    // 1. users (no dependencies)
    // 2. projects (depends on users)
    // 3. tasks (depends on projects)
    // 4. activities (depends on users)
    // 5. conversations (depends on users)
    // 6. messages (depends on conversations)
    // 7. chat_messages (depends on conversations)
    // 8. documents (depends on users)
    // 9. document_chunks (depends on documents)

    const tableStatements = [
      {
        name: 'users',
        sql: `
          CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `
      },
      {
        name: 'projects',
        sql: `
          CREATE TABLE IF NOT EXISTS projects (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            user_id INT NOT NULL,
            status ENUM('planning', 'active', 'completed') NOT NULL DEFAULT 'planning',
            priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            CONSTRAINT fk_projects_user
              FOREIGN KEY (user_id) REFERENCES users(id)
              ON DELETE CASCADE
              ON UPDATE CASCADE
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `
      },
      {
        name: 'tasks',
        sql: `
          CREATE TABLE IF NOT EXISTS tasks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            project_id INT NOT NULL,
            status ENUM('todo', 'in-progress', 'done') NOT NULL DEFAULT 'todo',
            priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
            due_date DATE NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            CONSTRAINT fk_tasks_project
              FOREIGN KEY (project_id) REFERENCES projects(id)
              ON DELETE CASCADE
              ON UPDATE CASCADE
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `
      },
      {
        name: 'activities',
        sql: `
          CREATE TABLE IF NOT EXISTS activities (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            type VARCHAR(100) NOT NULL,
            message VARCHAR(500) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_activities_user
              FOREIGN KEY (user_id) REFERENCES users(id)
              ON DELETE CASCADE
              ON UPDATE CASCADE,
            INDEX idx_activities_user_id (user_id),
            INDEX idx_activities_created_at (created_at)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `
      },
      {
        name: 'conversations',
        sql: `
          CREATE TABLE IF NOT EXISTS conversations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            title VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            CONSTRAINT fk_conversations_user
              FOREIGN KEY (user_id) REFERENCES users(id)
              ON DELETE CASCADE
              ON UPDATE CASCADE,
            INDEX idx_conversations_user_id (user_id),
            INDEX idx_conversations_updated_at (updated_at)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `
      },
      {
        name: 'messages',
        sql: `
          CREATE TABLE IF NOT EXISTS messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            conversation_id INT NOT NULL,
            role ENUM('user', 'assistant') NOT NULL,
            content LONGTEXT NOT NULL,
            sources JSON NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_messages_conversation
              FOREIGN KEY (conversation_id) REFERENCES conversations(id)
              ON DELETE CASCADE
              ON UPDATE CASCADE,
            INDEX idx_messages_conversation_id (conversation_id),
            INDEX idx_messages_created_at (created_at)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `
      },
      {
        name: 'chat_messages',
        sql: `
          CREATE TABLE IF NOT EXISTS chat_messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            conversation_id INT NOT NULL,
            role ENUM('user', 'assistant') NOT NULL,
            content LONGTEXT NOT NULL,
            sources LONGTEXT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_chat_messages_conversation
              FOREIGN KEY (conversation_id) REFERENCES conversations(id)
              ON DELETE CASCADE
              ON UPDATE CASCADE,
            INDEX idx_chat_messages_conversation_id (conversation_id),
            INDEX idx_chat_messages_created_at (created_at)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `
      },
      {
        name: 'documents',
        sql: `
          CREATE TABLE IF NOT EXISTS documents (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            name VARCHAR(255) NOT NULL,
            original_name VARCHAR(255) NOT NULL,
            file_path VARCHAR(500) NOT NULL,
            mime_type VARCHAR(100) NOT NULL,
            file_size INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_documents_user
              FOREIGN KEY (user_id) REFERENCES users(id)
              ON DELETE CASCADE
              ON UPDATE CASCADE,
            INDEX idx_documents_user_id (user_id),
            INDEX idx_documents_created_at (created_at)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `
      },
      {
        name: 'document_chunks',
        sql: `
          CREATE TABLE IF NOT EXISTS document_chunks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            document_id INT NOT NULL,
            chunk_index INT NOT NULL,
            content LONGTEXT NOT NULL,
            embedding LONGTEXT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_document_chunks_document
              FOREIGN KEY (document_id) REFERENCES documents(id)
              ON DELETE CASCADE
              ON UPDATE CASCADE,
            INDEX idx_document_chunks_document_id (document_id),
            INDEX idx_document_chunks_chunk_index (chunk_index)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `
      }
    ];

    console.log('Applying database tables...');
    for (const item of tableStatements) {
      process.stdout.write(`  - Table '${item.name}' ... `);
      await connection.query(item.sql);
      console.log('OK');
    }

    // Verify all required tables exist in database
    console.log('\nVerifying required tables in schema:');
    const [rows] = await connection.query('SHOW TABLES');
    const existingTables = rows.map((r) => Object.values(r)[0]);

    const requiredTables = [
      'users',
      'projects',
      'tasks',
      'activities',
      'conversations',
      'chat_messages',
      'documents',
      'document_chunks'
    ];

    let allPresent = true;
    for (const table of requiredTables) {
      const exists = existingTables.includes(table);
      console.log(`  [${exists ? '✓' : '✗'}] ${table}`);
      if (!exists) allPresent = false;
    }

    if (allPresent) {
      console.log('\nSUCCESS: All required tables exist and are ready for production use.');
    } else {
      console.warn('\nWARNING: One or more required tables could not be verified.');
    }
  } catch (err) {
    console.error('\nInitialization error:', err.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

initDatabase();
