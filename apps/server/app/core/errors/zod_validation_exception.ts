import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'
import * as z from 'zod'

type ExceptionOptions = NonNullable<ConstructorParameters<typeof Exception>[1]>

export class ZodValidationException extends Exception {
  static status = 422
  static code = 'E_ZOD_VALIDATION_FAILURE'

  constructor(
    public cause: z.core.$ZodError,
    options?: ExceptionOptions
  ) {
    super('Validation failure', options)
  }

  async handle(error: this, ctx: HttpContext) {
    ctx.response.status(error.status).json({
      errors: error.cause.issues,
    })
  }
}
