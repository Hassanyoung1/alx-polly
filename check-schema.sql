-- Quick check to see the actual column names in poll_options table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'poll_options' 
AND table_schema = 'public'
ORDER BY ordinal_position;
