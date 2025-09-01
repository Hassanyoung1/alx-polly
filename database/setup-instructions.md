# Database Setup Instructions

## Step 1: Create Database Tables

Go to your Supabase project dashboard:
1. Navigate to **SQL Editor**
2. Create a new query
3. Copy and paste the following SQL:

```sql
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

-- Basic RLS Policies
CREATE POLICY "Anyone can view active polls" ON public.polls
    FOR SELECT USING (is_active = true);

CREATE POLICY "Users can create polls" ON public.polls
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Anyone can view poll options" ON public.poll_options
    FOR SELECT USING (true);

CREATE POLICY "Poll creators can manage options" ON public.poll_options
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.polls 
            WHERE polls.id = poll_options.poll_id 
            AND polls.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can view votes" ON public.votes
    FOR SELECT USING (true);

CREATE POLICY "Users can create votes" ON public.votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## Step 2: Run the Query

Click **Run** to execute the SQL and create your database tables.

## Step 3: Test the Application

After creating the tables, your ALX Polly application should work properly:

1. **Register/Login**: Create an account or sign in
2. **View Polls**: Browse existing polls at `/polls`
3. **Create Poll**: Create new polls at `/polls/new`
4. **Vote**: Vote on polls and see results

## Database Structure

Your database now has:

- **polls**: Main poll data (title, description, creator, etc.)
- **poll_options**: Individual options for each poll
- **votes**: User votes linked to polls and options
- **Row Level Security**: Proper permissions and access control

## Troubleshooting

If you still see errors:

1. Check that all tables were created in the **Table Editor**
2. Verify Row Level Security is enabled
3. Make sure your service role key is correct in `.env.local`
4. Restart your development server: `npm run dev`
