'use server'

import { createPoll, vote } from './polls'
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
