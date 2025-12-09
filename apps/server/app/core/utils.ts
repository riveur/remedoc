import * as z from 'zod'

import { errors } from '#core/errors/main'

export function validateUsingZod<T>(options: { schema: z.ZodType<T>; data: unknown }): T {
  const { schema, data } = options

  const result = schema.safeParse(data)
  if (!result.success) {
    throw new errors.E_ZOD_VALIDATION_FAILURE(result.error)
  }

  return result.data
}
