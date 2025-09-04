-- Security patch: Database constraints for vote integrity
-- Fixes: V-006 - Race conditions and duplicate vote prevention

-- Add unique constraints to prevent race conditions and duplicate votes
-- This ensures atomic vote operations at the database level

-- 1. Ensure one vote per user per poll (authenticated users)
DO $$
BEGIN
    -- Check if constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_user_poll_vote' 
        AND table_name = 'votes'
    ) THEN
        ALTER TABLE votes ADD CONSTRAINT unique_user_poll_vote 
        UNIQUE(poll_id, user_id);
    END IF;
END $$;

-- 2. Ensure one vote per session per poll (anonymous users)
DO $$
BEGIN
    -- Check if constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_session_poll_vote' 
        AND table_name = 'votes'
    ) THEN
        ALTER TABLE votes ADD CONSTRAINT unique_session_poll_vote 
        UNIQUE(poll_id, session_id);
    END IF;
END $$;

-- 3. Ensure vote references valid option for the poll
DO $$
BEGIN
    -- Check if constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'valid_option_for_poll' 
        AND table_name = 'votes'
    ) THEN
        ALTER TABLE votes ADD CONSTRAINT valid_option_for_poll 
        CHECK (
            EXISTS (
                SELECT 1 FROM poll_options 
                WHERE poll_options.id = votes.option_id 
                AND poll_options.poll_id = votes.poll_id
            )
        );
    END IF;
END $$;

-- 4. Enhanced function for atomic vote operations
CREATE OR REPLACE FUNCTION atomic_vote_submission(
    p_poll_id UUID,
    p_option_id UUID,
    p_user_id UUID DEFAULT NULL,
    p_session_id TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
    poll_record RECORD;
    option_record RECORD;
    vote_record RECORD;
    result JSON;
BEGIN
    -- Validate inputs
    IF p_poll_id IS NULL OR p_option_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Poll ID and Option ID are required'
        );
    END IF;

    IF p_user_id IS NULL AND p_session_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Either user ID or session ID must be provided'
        );
    END IF;

    -- Start transaction (implicit in function)
    -- Lock the poll to prevent concurrent modifications
    SELECT * INTO poll_record FROM polls 
    WHERE id = p_poll_id 
    FOR UPDATE;

    -- Validate poll exists and is active
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Poll not found'
        );
    END IF;

    IF NOT poll_record.is_active THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Poll is not active'
        );
    END IF;

    -- Check if poll has expired
    IF poll_record.expires_at IS NOT NULL AND poll_record.expires_at < NOW() THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Poll has expired'
        );
    END IF;

    -- Validate option belongs to poll
    SELECT * INTO option_record FROM poll_options 
    WHERE id = p_option_id AND poll_id = p_poll_id;

    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Invalid option for this poll'
        );
    END IF;

    -- Check for existing vote
    IF p_user_id IS NOT NULL THEN
        SELECT * INTO vote_record FROM votes 
        WHERE poll_id = p_poll_id AND user_id = p_user_id;
        
        IF FOUND THEN
            RETURN json_build_object(
                'success', false,
                'error', 'User has already voted on this poll'
            );
        END IF;
    ELSE
        SELECT * INTO vote_record FROM votes 
        WHERE poll_id = p_poll_id AND session_id = p_session_id;
        
        IF FOUND THEN
            RETURN json_build_object(
                'success', false,
                'error', 'Session has already voted on this poll'
            );
        END IF;
    END IF;

    -- Insert the vote
    INSERT INTO votes (poll_id, option_id, user_id, session_id, created_at)
    VALUES (p_poll_id, p_option_id, p_user_id, p_session_id, NOW())
    RETURNING * INTO vote_record;

    -- Return success with vote details
    RETURN json_build_object(
        'success', true,
        'data', json_build_object(
            'vote_id', vote_record.id,
            'poll_id', vote_record.poll_id,
            'option_id', vote_record.option_id,
            'user_id', vote_record.user_id,
            'session_id', vote_record.session_id,
            'created_at', vote_record.created_at
        )
    );

EXCEPTION
    WHEN unique_violation THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Vote already exists for this poll'
        );
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Failed to submit vote: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql;

-- 5. Enhanced security logging table
CREATE TABLE IF NOT EXISTS security_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_type TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    request_path TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for security event queries
CREATE INDEX IF NOT EXISTS idx_security_events_type_time ON security_events(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_user_time ON security_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_ip_time ON security_events(ip_address, created_at DESC);

-- Function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
    p_event_type TEXT,
    p_user_id UUID DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_request_path TEXT DEFAULT NULL,
    p_details JSONB DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    INSERT INTO security_events (
        event_type, user_id, ip_address, user_agent, request_path, details
    ) VALUES (
        p_event_type, p_user_id, p_ip_address, p_user_agent, p_request_path, p_details
    );
END;
$$ LANGUAGE plpgsql;

-- 6. Rate limiting table for persistent storage
CREATE TABLE IF NOT EXISTS rate_limit_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    identifier TEXT NOT NULL, -- IP address or user ID
    endpoint TEXT NOT NULL,
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    blocked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Unique constraint for rate limiting
CREATE UNIQUE INDEX IF NOT EXISTS idx_rate_limit_identifier_endpoint 
ON rate_limit_entries(identifier, endpoint);

-- Index for cleanup queries
CREATE INDEX IF NOT EXISTS idx_rate_limit_window_start ON rate_limit_entries(window_start);
CREATE INDEX IF NOT EXISTS idx_rate_limit_blocked_until ON rate_limit_entries(blocked_until);

-- Function to check and update rate limits
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_identifier TEXT,
    p_endpoint TEXT,
    p_max_requests INTEGER DEFAULT 10,
    p_window_minutes INTEGER DEFAULT 15,
    p_block_minutes INTEGER DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
    current_entry RECORD;
    window_start_time TIMESTAMP WITH TIME ZONE;
    block_until_time TIMESTAMP WITH TIME ZONE;
    remaining_requests INTEGER;
BEGIN
    window_start_time := NOW() - (p_window_minutes || ' minutes')::INTERVAL;
    
    -- Get or create rate limit entry
    SELECT * INTO current_entry FROM rate_limit_entries 
    WHERE identifier = p_identifier AND endpoint = p_endpoint;

    -- Check if currently blocked
    IF current_entry.blocked_until IS NOT NULL AND current_entry.blocked_until > NOW() THEN
        RETURN json_build_object(
            'allowed', false,
            'remaining_requests', 0,
            'reset_time', extract(epoch from current_entry.blocked_until),
            'blocked_until', current_entry.blocked_until
        );
    END IF;

    -- Reset window if expired or no entry exists
    IF current_entry IS NULL OR current_entry.window_start < window_start_time THEN
        INSERT INTO rate_limit_entries (identifier, endpoint, request_count, window_start)
        VALUES (p_identifier, p_endpoint, 1, NOW())
        ON CONFLICT (identifier, endpoint) 
        DO UPDATE SET 
            request_count = 1,
            window_start = NOW(),
            blocked_until = NULL,
            updated_at = NOW();

        RETURN json_build_object(
            'allowed', true,
            'remaining_requests', p_max_requests - 1,
            'reset_time', extract(epoch from (NOW() + (p_window_minutes || ' minutes')::INTERVAL))
        );
    END IF;

    -- Check if limit exceeded
    IF current_entry.request_count >= p_max_requests THEN
        -- Apply block if specified
        IF p_block_minutes IS NOT NULL THEN
            block_until_time := NOW() + (p_block_minutes || ' minutes')::INTERVAL;
            UPDATE rate_limit_entries 
            SET blocked_until = block_until_time, updated_at = NOW()
            WHERE identifier = p_identifier AND endpoint = p_endpoint;
        END IF;

        RETURN json_build_object(
            'allowed', false,
            'remaining_requests', 0,
            'reset_time', extract(epoch from (current_entry.window_start + (p_window_minutes || ' minutes')::INTERVAL)),
            'blocked_until', block_until_time
        );
    END IF;

    -- Increment count
    UPDATE rate_limit_entries 
    SET request_count = request_count + 1, updated_at = NOW()
    WHERE identifier = p_identifier AND endpoint = p_endpoint;

    remaining_requests := p_max_requests - (current_entry.request_count + 1);

    RETURN json_build_object(
        'allowed', true,
        'remaining_requests', remaining_requests,
        'reset_time', extract(epoch from (current_entry.window_start + (p_window_minutes || ' minutes')::INTERVAL))
    );
END;
$$ LANGUAGE plpgsql;

-- 7. Cleanup function for expired rate limit entries
CREATE OR REPLACE FUNCTION cleanup_rate_limit_entries() RETURNS VOID AS $$
BEGIN
    DELETE FROM rate_limit_entries 
    WHERE window_start < NOW() - INTERVAL '1 day'
    AND (blocked_until IS NULL OR blocked_until < NOW());
END;
$$ LANGUAGE plpgsql;

-- Setup periodic cleanup (requires pg_cron extension in production)
-- In production, run this periodically: SELECT cron.schedule('cleanup-rate-limits', '0 * * * *', 'SELECT cleanup_rate_limit_entries();');

COMMENT ON TABLE security_events IS 'Log of security-related events for monitoring and analysis';
COMMENT ON TABLE rate_limit_entries IS 'Persistent storage for rate limiting across server restarts';
COMMENT ON FUNCTION atomic_vote_submission IS 'Atomic vote submission with race condition protection';
COMMENT ON FUNCTION log_security_event IS 'Log security events for monitoring';
COMMENT ON FUNCTION check_rate_limit IS 'Check and update rate limits with persistent storage';
