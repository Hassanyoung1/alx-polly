-- ALX Polly Database Setup - Run this in Supabase SQL Editor
-- Copy everything below and paste into Supabase SQL Editor, then click RUN

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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY; 
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Create simple policies (allow all for now - you can restrict later)
CREATE POLICY "Allow all operations on polls" ON public.polls FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on poll_options" ON public.poll_options FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on votes" ON public.votes FOR ALL USING (true) WITH CHECK (true);
