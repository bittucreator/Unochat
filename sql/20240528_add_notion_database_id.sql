-- Migration: Add notion_database_id column to users table
ALTER TABLE users ADD COLUMN notion_database_id TEXT;
