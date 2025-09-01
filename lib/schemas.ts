import { z } from 'zod'

export const createPollSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  options: z.array(z.string().min(1, 'Option text is required').max(100, 'Option must be less than 100 characters'))
    .min(2, 'At least 2 options are required')
    .max(10, 'Maximum 10 options allowed'),
  expiresAt: z.string().optional()
})

export type CreatePollFormData = z.infer<typeof createPollSchema>


