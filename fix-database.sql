-- Fix for ALX Polly Database - Allow NULL created_by for polls
-- Run this in your Supabase SQL Editor

-- Allow NULL values for created_by field
ALTER TABLE polls ALTER COLUMN created_by DROP NOT NULL;

-- Update RLS policy to allow polls with NULL created_by
DROP POLICY IF EXISTS "Users can create polls" ON polls;
CREATE POLICY "Users can create polls" ON polls
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR true);

-- Verify the change
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'polls' AND column_name = 'created_by';

-- Test: Create a poll without a user (should work now)
-- INSERT INTO polls (title, description, is_active) VALUES ('Test Poll', 'Testing NULL created_by', true);


