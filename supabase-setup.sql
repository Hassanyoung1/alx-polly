-- Quick Supabase Setup for ALX Polly
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create polls table
CREATE TABLE IF NOT EXISTS polls (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL CHECK (length(title) > 0 AND length(title) <= 200),
    description TEXT CHECK (length(description) <= 1000),
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- Create poll_options table
CREATE TABLE IF NOT EXISTS poll_options (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    text TEXT NOT NULL CHECK (length(text) > 0 AND length(text) <= 100),
    order_num INTEGER NOT NULL CHECK (order_num > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(poll_id, order_num)
);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    option_id UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(poll_id, user_id),
    UNIQUE(poll_id, session_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_polls_created_by ON polls(created_by);
CREATE INDEX IF NOT EXISTS idx_polls_is_active ON polls(is_active);
CREATE INDEX IF NOT EXISTS idx_polls_created_at ON polls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_poll_options_poll_id ON poll_options(poll_id);
CREATE INDEX IF NOT EXISTS idx_votes_poll_id ON votes(poll_id);

-- Enable RLS
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies
CREATE POLICY "Users can view active polls" ON polls FOR SELECT USING (is_active = true);
CREATE POLICY "Users can create polls" ON polls FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can view poll options" ON poll_options FOR SELECT USING (true);
CREATE POLICY "Users can create poll options" ON poll_options FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can view votes" ON votes FOR SELECT USING (true);
CREATE POLICY "Users can create votes" ON votes FOR INSERT WITH CHECK (true);

-- Success message
SELECT 'Database setup completed successfully!' as status;
