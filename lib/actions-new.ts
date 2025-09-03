'use server'

import { createPollAPI, updatePollAPI, deletePollAPI } from './api-client'
import { vote } from './polls'
import { createPollSchema } from './schemas'
import { revalidatePath } from 'next/cache'

export async function createPollActionNew(formData: FormData) {
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

    // Call the new API endpoint
    const poll = await createPollAPI(validatedData)

    // Revalidate the polls list page
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

export async function updatePollActionNew(pollId: string, formData: FormData) {
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

    // Call the new API endpoint
    const poll = await updatePollAPI(pollId, validatedData)

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

export async function deletePollActionNew(pollId: string) {
  try {
    await deletePollAPI(pollId)

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

// Keep the vote action the same as it doesn't need the new structure
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
