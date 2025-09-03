import { supabaseServer } from './supabaseServer'
import { Poll, CreatePollRequest, Vote } from '@/types'

export async function createPoll(pollData: CreatePollRequest): Promise<Poll> {
  try {
    // Insert poll
    const { data: poll, error: pollError } = await supabaseServer
      .from('polls')
      .insert({
        title: pollData.title,
        description: pollData.description,
        expires_at: pollData.expiresAt ? new Date(pollData.expiresAt).toISOString() : null,
        is_active: true,
        created_by: null // TODO: Get from auth context when authentication is implemented
      })
      .select()
      .single()

    if (pollError) throw pollError

    // Insert poll options
    const optionsData = pollData.options.map((text, index) => ({
      poll_id: poll.id,
      text,
      order_num: index + 1
    }))

    const { error: optionsError } = await supabaseServer
      .from('poll_options')
      .insert(optionsData)

    if (optionsError) throw optionsError

    // Fetch the complete poll with options
    const { data: completePoll, error: fetchError } = await supabaseServer
      .from('polls')
      .select(`
        *,
        poll_options (*)
      `)
      .eq('id', poll.id)
      .single()

    if (fetchError) throw fetchError

    return completePoll as Poll
  } catch (error) {
    console.error('Error creating poll:', error)
    throw new Error('Failed to create poll')
  }
}

export async function getPolls(): Promise<Poll[]> {
  try {
    const { data: polls, error } = await supabaseServer
      .from('polls')
      .select(`
        *,
        poll_options (*)
      `)
      // Show all polls (active and inactive) for management
      .order('created_at', { ascending: false })

    if (error) throw error
    
    // Transform the data to match our interface
    const transformedPolls = polls?.map(poll => ({
      ...poll,
      options: poll.poll_options || [],
      votes: [] // We'll fetch votes separately if needed
    })) || []
    
    return transformedPolls as Poll[]
  } catch (error) {
    console.error('Error fetching polls:', error)
    throw new Error('Failed to fetch polls')
  }
}

export async function getPoll(id: string): Promise<Poll | null> {
  try {
    const { data: poll, error } = await supabaseServer
      .from('polls')
      .select(`
        *,
        poll_options (*),
        votes (*)
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // No rows returned
      throw error
    }

    // Transform the data to match our interface
    const transformedPoll = {
      ...poll,
      options: poll.poll_options || [],
      votes: poll.votes || []
    }

    return transformedPoll as Poll
  } catch (error) {
    console.error('Error fetching poll:', error)
    throw new Error('Failed to fetch poll')
  }
}

export async function getPollForEdit(id: string): Promise<Poll | null> {
  try {
    const { data: poll, error } = await supabaseServer
      .from('polls')
      .select(`
        *,
        poll_options (*),
        votes (*)
      `)
      .eq('id', id)
      // Note: No is_active filter for editing - users should be able to edit inactive polls
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // No rows returned
      throw error
    }

    // Transform the data to match our interface
    const transformedPoll = {
      ...poll,
      options: poll.poll_options || [],
      votes: poll.votes || []
    }

    return transformedPoll as Poll
  } catch (error) {
    console.error('Error fetching poll for edit:', error)
    throw new Error('Failed to fetch poll for editing')
  }
}

export async function vote(pollId: string, optionId: string, userId?: string): Promise<Vote> {
  try {
    // Check if user already voted on this poll
    if (userId) {
      const { data: existingVote } = await supabaseServer
        .from('votes')
        .select('*')
        .eq('poll_id', pollId)
        .eq('user_id', userId)
        .single()

      if (existingVote) {
        throw new Error('User has already voted on this poll')
      }
    }

    // Create new vote
    const { data: vote, error } = await supabaseServer
      .from('votes')
      .insert({
        poll_id: pollId,
        option_id: optionId,
        user_id: userId || null
      })
      .select()
      .single()

    if (error) throw error

    return vote as Vote
  } catch (error) {
    console.error('Error voting:', error)
    throw error
  }
}

export async function getUserVote(pollId: string, userId?: string): Promise<Vote | null> {
  try {
    if (!userId) return null

    const { data: vote, error } = await supabaseServer
      .from('votes')
      .select('*')
      .eq('poll_id', pollId)
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // No rows returned
      throw error
    }

    return vote as Vote
  } catch (error) {
    console.error('Error fetching user vote:', error)
    return null
  }
}

export async function updatePoll(pollId: string, pollData: Partial<CreatePollRequest>): Promise<Poll> {
  try {
    // Update poll basic info
    const updateData: Record<string, unknown> = {}
    if (pollData.title) updateData.title = pollData.title
    if (pollData.description !== undefined) updateData.description = pollData.description
    if (pollData.expiresAt !== undefined) {
      updateData.expires_at = pollData.expiresAt ? new Date(pollData.expiresAt).toISOString() : null
    }

    const { error: pollError } = await supabaseServer
      .from('polls')
      .update(updateData)
      .eq('id', pollId)
      .select()
      .single()

    if (pollError) throw pollError

    // Update poll options if provided
    if (pollData.options && pollData.options.length > 0) {
      // Delete existing options
      const { error: deleteError } = await supabaseServer
        .from('poll_options')
        .delete()
        .eq('poll_id', pollId)

      if (deleteError) throw deleteError

      // Insert new options
      const optionsData = pollData.options.map((text, index) => ({
        poll_id: pollId,
        text,
        order_num: index + 1
      }))

      const { error: optionsError } = await supabaseServer
        .from('poll_options')
        .insert(optionsData)

      if (optionsError) throw optionsError
    }

    // Fetch the complete updated poll with options
    const { data: completePoll, error: fetchError } = await supabaseServer
      .from('polls')
      .select(`
        *,
        poll_options (*),
        votes (*)
      `)
      .eq('id', pollId)
      .single()

    if (fetchError) throw fetchError

    // Transform the data to match our interface
    const transformedPoll = {
      ...completePoll,
      options: completePoll.poll_options || [],
      votes: completePoll.votes || []
    }

    return transformedPoll as Poll
  } catch (error) {
    console.error('Error updating poll:', error)
    throw new Error('Failed to update poll')
  }
}

export async function deletePoll(pollId: string): Promise<boolean> {
  try {
    // Delete votes first (foreign key constraint)
    const { error: votesError } = await supabaseServer
      .from('votes')
      .delete()
      .eq('poll_id', pollId)

    if (votesError) throw votesError

    // Delete poll options
    const { error: optionsError } = await supabaseServer
      .from('poll_options')
      .delete()
      .eq('poll_id', pollId)

    if (optionsError) throw optionsError

    // Delete the poll itself
    const { error: pollError } = await supabaseServer
      .from('polls')
      .delete()
      .eq('id', pollId)

    if (pollError) throw pollError

    return true
  } catch (error) {
    console.error('Error deleting poll:', error)
    throw new Error('Failed to delete poll')
  }
}

export async function togglePollStatus(pollId: string, isActive: boolean): Promise<Poll> {
  try {
    const { data: poll, error } = await supabaseServer
      .from('polls')
      .update({ is_active: isActive })
      .eq('id', pollId)
      .select(`
        *,
        poll_options (*),
        votes (*)
      `)
      .single()

    if (error) throw error

    // Transform the data to match our interface
    const transformedPoll = {
      ...poll,
      options: poll.poll_options || [],
      votes: poll.votes || []
    }

    return transformedPoll as Poll
  } catch (error) {
    console.error('Error toggling poll status:', error)
    throw new Error('Failed to toggle poll status')
  }
}


