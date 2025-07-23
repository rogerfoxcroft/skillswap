-- Migration to remove email column from users table
-- Email should not be stored in database as it can change and creates data inconsistency
-- Email will be retrieved from JWT claims instead

ALTER TABLE users DROP COLUMN IF EXISTS email;

-- Also remove any email-related constraints/indexes if they exist
DROP INDEX IF EXISTS idx_users_email;

-- Note: This migration should be run on both local and production databases