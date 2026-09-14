-- =============================================================================
-- Migration: Add password column to users table
-- Target: ai_project_task_manager.users
-- =============================================================================

USE ai_project_task_manager;

-- Safely add the password column if it doesn't already exist.
-- The column is added as VARCHAR(255) NULL to allow existing user accounts
-- to persist without constraint violations.
-- Existing users without passwords will have NULL, preventing login until
-- their password is set or updated. Fresh registrations will always store
-- a valid bcrypt password hash.
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255) NULL AFTER email;
