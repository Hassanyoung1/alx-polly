'use server'

import { createPoll, vote, updatePoll, deletePoll, togglePollStatus } from './polls'
import { createPollSchema } from './schemas'
import { revalidatePath } from 'next/cache'

export async function createPollAction(formData: FormData) {
  try {
    // Extract and validate form data
    const rawData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string || undefined,
      options: formData.getAll('options') as string[],
      expiresAt: formData.get('expiresAt') as string || undefined
    }

    // Validate with Zod
    const validatedData = createPollSchema.parse(rawData)

    // Convert expiration date to proper format if provided
    let expiresAt = validatedData.expiresAt
    if (expiresAt && expiresAt.trim() !== '') {
      try {
        // Create date object from the datetime-local input
        // Note: new Date() with this format treats it as local time
        const localDate = new Date(expiresAt)
        
        // Check if the date is valid and store as ISO string (UTC)
        if (!isNaN(localDate.getTime())) {
          expiresAt = localDate.toISOString()
        } else {
          console.warn('❌ Invalid date format:', expiresAt)
          expiresAt = undefined
        }
      } catch (error) {
        console.error('❌ Error parsing date:', error)
        expiresAt = undefined
      }
    }

    // Create poll in database
    const poll = await createPoll({
      ...validatedData,
      expiresAt
    })

    // Revalidate polls list and new poll page
    revalidatePath('/polls')
    revalidatePath(`/polls/${poll.id}`)

    return { success: true, data: poll }
  } catch (error) {
    console.error('Error creating poll:', error)
    
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    
    return { success: false, error: 'Failed to create poll' }
  }
}

export async function voteAction(pollId: string, optionId: string, userId?: string) {
  try {
    const voteResult = await vote(pollId, optionId, userId)

    // Revalidate the poll page to show updated vote counts
    revalidatePath(`/polls/${pollId}`)

    return { success: true, data: voteResult }
  } catch (error) {
    console.error('Error voting:', error)
    
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    
    return { success: false, error: 'Failed to submit vote' }
  }
}

export async function updatePollAction(pollId: string, formData: FormData) {
  try {
    // Extract and validate form data
    const rawData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string || undefined,
      options: formData.getAll('options') as string[],
      expiresAt: formData.get('expiresAt') as string || undefined
    }

    // Filter out empty options
    const filteredOptions = rawData.options.filter(option => option.trim() !== '')

    // Validate with Zod (partial update)
    const validatedData = createPollSchema.partial().parse({
      ...rawData,
      options: filteredOptions.length > 0 ? filteredOptions : undefined
    })

    // Convert expiration date if provided
    let expiresAt = validatedData.expiresAt
    if (expiresAt && expiresAt.trim() !== '') {
      try {
        const localDate = new Date(expiresAt)
        if (!isNaN(localDate.getTime())) {
          expiresAt = localDate.toISOString()
        } else {
          console.warn('❌ Invalid date format:', expiresAt)
          expiresAt = undefined
        }
      } catch (error) {
        console.error('❌ Error parsing date:', error)
        expiresAt = undefined
      }
    }

    // Update poll in database
    const poll = await updatePoll(pollId, {
      ...validatedData,
      expiresAt
    })

    // Revalidate relevant pages
    revalidatePath('/polls')
    revalidatePath(`/polls/${pollId}`)
    revalidatePath(`/polls/${pollId}/edit`)

    return { success: true, data: poll }
  } catch (error) {
    console.error('Error updating poll:', error)
    
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    
    return { success: false, error: 'Failed to update poll' }
  }
}

export async function deletePollAction(pollId: string) {
  try {
    await deletePoll(pollId)

    // Revalidate polls list
    revalidatePath('/polls')

    return { success: true }
  } catch (error) {
    console.error('Error deleting poll:', error)
    
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    
    return { success: false, error: 'Failed to delete poll' }
  }
}

export async function togglePollStatusAction(pollId: string, isActive: boolean) {
  try {
    const poll = await togglePollStatus(pollId, isActive)

    // Revalidate relevant pages
    revalidatePath('/polls')
    revalidatePath(`/polls/${pollId}`)

    return { success: true, data: poll }
  } catch (error) {
    console.error('Error toggling poll status:', error)
    
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    
    return { success: false, error: 'Failed to toggle poll status' }
  }
}
