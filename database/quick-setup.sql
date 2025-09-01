-- Simple Database Setup for ALX Polly
-- Copy and paste this into your Supabase SQL Editor

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

-- Enable Row Level Security
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (permissive for now)
CREATE POLICY "Enable read access for all users" ON public.polls FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.polls FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for users based on user_id" ON public.polls FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Enable read access for all users" ON public.poll_options FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.poll_options FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON public.votes FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.votes FOR INSERT WITH CHECK (auth.role() = 'authenticated');