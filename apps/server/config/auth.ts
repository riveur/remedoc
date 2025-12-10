import { defineConfig } from '@adonisjs/auth'
import { tokensGuard } from '@adonisjs/auth/access_tokens'
import type { Authenticators, InferAuthenticators, InferAuthEvents } from '@adonisjs/auth/types'

import { AccessTokensDrizzleUserProvider } from '#auth/user_providers/drizzle'

const authConfig = defineConfig({
  default: 'api',
  guards: {
    api: tokensGuard({
      provider: new AccessTokensDrizzleUserProvider(),
    }),
  },
})

export default authConfig

/**
 * Inferring types from the configured auth
 * guards.
 */
declare module '@adonisjs/auth/types' {
  export interface Authenticators extends InferAuthenticators<typeof authConfig> {}
}
declare module '@adonisjs/core/types' {
  interface EventsList extends InferAuthEvents<Authenticators> {}
}
