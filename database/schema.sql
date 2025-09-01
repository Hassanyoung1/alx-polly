-- ALX Polly Database Schema
-- Run these SQL commands in your Supabase SQL Editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create polls table
CREATE TABLE IF NOT EXISTS public.polls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- Create poll_options table
CREATE TABLE IF NOT EXISTS public.poll_options (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create votes table
CREATE TABLE IF NOT EXISTS public.votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE,
    option_id UUID REFERENCES public.poll_options(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(poll_id, user_id),
    UNIQUE(poll_id, session_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_polls_created_by ON public.polls(created_by);
CREATE INDEX IF NOT EXISTS idx_polls_created_at ON public.polls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_poll_options_poll_id ON public.poll_options(poll_id);
CREATE INDEX IF NOT EXISTS idx_votes_poll_id ON public.votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON public.votes(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for polls table
CREATE POLICY "Anyone can view active polls" ON public.polls
    FOR SELECT USING (is_active = true);

CREATE POLICY "Users can create polls" ON public.polls
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own polls" ON public.polls
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own polls" ON public.polls
    FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for poll_options table
CREATE POLICY "Anyone can view poll options" ON public.poll_options
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.polls 
            WHERE polls.id = poll_options.poll_id 
            AND polls.is_active = true
        )
    );

CREATE POLICY "Poll creators can manage options" ON public.poll_options
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.polls 
            WHERE polls.id = poll_options.poll_id 
            AND polls.created_by = auth.uid()
        )
    );

-- RLS Policies for votes table
CREATE POLICY "Users can view all votes" ON public.votes
    FOR SELECT USING (true);

CREATE POLICY "Users can create votes" ON public.votes
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.polls 
            WHERE polls.id = votes.poll_id 
            AND polls.is_active = true 
            AND (polls.expires_at IS NULL OR polls.expires_at > NOW())
        )
    );

CREATE POLICY "Users can update their own votes" ON public.votes
    FOR UPDATE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_polls_updated_at 
    BEFORE UPDATE ON public.polls 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing
INSERT INTO public.polls (title, description, created_by, expires_at) VALUES
('Favorite Programming Language', 'What is your favorite programming language for web development?', (SELECT id FROM auth.users LIMIT 1), NOW() + INTERVAL '7 days'),
('Best Framework', 'Which framework do you prefer for building web applications?', (SELECT id FROM auth.users LIMIT 1), NOW() + INTERVAL '5 days');

-- Get the poll IDs for inserting options
DO $$
DECLARE
    poll1_id UUID;
    poll2_id UUID;
BEGIN
    SELECT id INTO poll1_id FROM public.polls WHERE title = 'Favorite Programming Language' LIMIT 1;
    SELECT id INTO poll2_id FROM public.polls WHERE title = 'Best Framework' LIMIT 1;
    
    IF poll1_id IS NOT NULL THEN
        INSERT INTO public.poll_options (poll_id, text, order_index) VALUES
        (poll1_id, 'JavaScript', 1),
        (poll1_id, 'TypeScript', 2),
        (poll1_id, 'Python', 3),
        (poll1_id, 'Go', 4);
    END IF;
    
    IF poll2_id IS NOT NULL THEN
        INSERT INTO public.poll_options (poll_id, text, order_index) VALUES
        (poll2_id, 'Next.js', 1),
        (poll2_id, 'React', 2),
        (poll2_id, 'Vue.js', 3),
        (poll2_id, 'Angular', 4);
    END IF;
END $$;
