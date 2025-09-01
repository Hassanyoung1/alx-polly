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
      .eq('is_active', true)
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


