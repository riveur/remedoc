import * as z from 'zod'

export const loginSearchSchema = z.object({
  redirect: z.string().optional(),
  code: z.string().optional(),
  state: z.string().optional(),
})
