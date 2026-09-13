-- =============================================================================
-- Migration: Create conversations and chat_messages tables
-- Target Database: ai_project_task_manager
-- =============================================================================

USE ai_project_task_manager;

-- 1. Conversations Table
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

-- 2. Chat Messages Table
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

-- 3. Populate chat_messages from legacy messages table if applicable
INSERT IGNORE INTO chat_messages (id, conversation_id, role, content, sources, created_at)
SELECT id, conversation_id, role, content, sources, created_at FROM messages;
