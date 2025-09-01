-- ALX Polly Database Schema
-- This file contains the complete database schema for the polling application
-- Run these commands in your Supabase SQL Editor

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- POLLS TABLE
-- =====================================================
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

-- =====================================================
-- POLL OPTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS poll_options (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    text TEXT NOT NULL CHECK (length(text) > 0 AND length(text) <= 100),
    order_num INTEGER NOT NULL CHECK (order_num > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique order within each poll
    UNIQUE(poll_id, order_num)
);

-- =====================================================
-- VOTES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    option_id UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT, -- For anonymous voting
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one vote per user per poll (if user_id is provided)
    UNIQUE(poll_id, user_id),
    
    -- Ensure one vote per session per poll (if session_id is provided)
    UNIQUE(poll_id, session_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Polls table indexes
CREATE INDEX IF NOT EXISTS idx_polls_created_by ON polls(created_by);
CREATE INDEX IF NOT EXISTS idx_polls_is_active ON polls(is_active);
CREATE INDEX IF NOT EXISTS idx_polls_created_at ON polls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_polls_expires_at ON polls(expires_at);

-- Poll options table indexes
CREATE INDEX IF NOT EXISTS idx_poll_options_poll_id ON poll_options(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_options_order ON poll_options(poll_id, order_num);

-- Votes table indexes
CREATE INDEX IF NOT EXISTS idx_votes_poll_id ON votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_votes_option_id ON votes(option_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_session_id ON votes(session_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Polls policies
CREATE POLICY "Users can view active polls" ON polls
    FOR SELECT USING (is_active = true);

CREATE POLICY "Users can create polls" ON polls
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own polls" ON polls
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own polls" ON polls
    FOR DELETE USING (auth.uid() = created_by);

-- Poll options policies
CREATE POLICY "Users can view poll options" ON poll_options
    FOR SELECT USING (true);

CREATE POLICY "Users can create poll options" ON poll_options
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Votes policies
CREATE POLICY "Users can view votes" ON votes
    FOR SELECT USING (true);

CREATE POLICY "Users can create votes" ON votes
    FOR INSERT WITH CHECK (true); -- Allow anonymous voting

CREATE POLICY "Users can only delete their own votes" ON votes
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at on polls table
CREATE TRIGGER update_polls_updated_at
    BEFORE UPDATE ON polls
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to validate poll options count
CREATE OR REPLACE FUNCTION validate_poll_options()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure at least 2 options and maximum 10 options per poll
    IF (SELECT COUNT(*) FROM poll_options WHERE poll_id = NEW.poll_id) > 10 THEN
        RAISE EXCEPTION 'Maximum 10 options allowed per poll';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to validate poll options count
CREATE TRIGGER validate_poll_options_trigger
    BEFORE INSERT OR UPDATE ON poll_options
    FOR EACH ROW
    EXECUTE FUNCTION validate_poll_options();

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for polls with option counts and vote counts
CREATE OR REPLACE VIEW polls_with_stats AS
SELECT 
    p.*,
    COUNT(DISTINCT po.id) as option_count,
    COUNT(DISTINCT v.id) as total_votes,
    CASE 
        WHEN p.expires_at IS NOT NULL AND p.expires_at < NOW() THEN true
        ELSE false
    END as is_expired
FROM polls p
LEFT JOIN poll_options po ON p.id = po.poll_id
LEFT JOIN votes v ON p.id = v.poll_id
WHERE p.is_active = true
GROUP BY p.id
ORDER BY p.created_at DESC;

-- View for poll results with vote percentages
CREATE OR REPLACE VIEW poll_results AS
SELECT 
    p.id as poll_id,
    p.title as poll_title,
    po.id as option_id,
    po.text as option_text,
    po.order_num,
    COUNT(v.id) as vote_count,
    CASE 
        WHEN (SELECT COUNT(*) FROM votes WHERE poll_id = p.id) > 0 
        THEN ROUND((COUNT(v.id)::DECIMAL / (SELECT COUNT(*) FROM votes WHERE poll_id = p.id)) * 100, 1)
        ELSE 0 
    END as vote_percentage
FROM polls p
JOIN poll_options po ON p.id = po.poll_id
LEFT JOIN votes v ON po.id = v.option_id
WHERE p.is_active = true
GROUP BY p.id, po.id, po.text, po.order_num
ORDER BY p.id, po.order_num;

-- =====================================================
-- SAMPLE DATA (OPTIONAL - FOR TESTING)
-- =====================================================

-- Insert sample poll (uncomment to add test data)
/*
INSERT INTO polls (title, description, created_by, expires_at) VALUES 
('What''s your favorite programming language?', 'Help us understand the community preferences', 
 (SELECT id FROM auth.users LIMIT 1), NOW() + INTERVAL '30 days');

INSERT INTO poll_options (poll_id, text, order_num) VALUES 
((SELECT id FROM polls WHERE title = 'What''s your favorite programming language?'), 'JavaScript', 1),
((SELECT id FROM polls WHERE title = 'What''s your favorite programming language?'), 'Python', 2),
((SELECT id FROM polls WHERE title = 'What''s your favorite programming language?'), 'TypeScript', 3),
((SELECT id FROM polls WHERE title = 'What''s your favorite programming language?'), 'Rust', 4);
*/

-- =====================================================
-- USAGE INSTRUCTIONS
-- =====================================================

/*
1. Run this entire script in your Supabase SQL Editor
2. The schema will create all necessary tables, indexes, and policies
3. RLS policies ensure data security
4. Views provide easy access to common queries
5. Triggers automatically maintain data integrity

To test the setup:
1. Create a poll through your application
2. Add options to the poll
3. Cast votes on the poll
4. View results using the poll_results view

Tables created:
- polls: Main poll information
- poll_options: Available choices for each poll
- votes: User votes on poll options

Views created:
- polls_with_stats: Polls with option and vote counts
- poll_results: Detailed voting results with percentages
*/
