-- Check Database Structure for ALX Polly
-- Run this in your Supabase SQL Editor to see what columns actually exist

-- Check polls table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'polls' 
ORDER BY ordinal_position;

-- Check poll_options table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'poll_options' 
ORDER BY ordinal_position;

-- Check votes table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'votes' 
ORDER BY ordinal_position;

-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('polls', 'poll_options', 'votes');


