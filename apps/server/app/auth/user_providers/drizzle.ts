import { symbols } from '@adonisjs/auth'
import { AccessToken } from '@adonisjs/auth/access_tokens'
import {
  AccessTokensGuardUser,
  AccessTokensUserProviderContract,
} from '@adonisjs/auth/types/access_tokens'
import type { Secret } from '@adonisjs/core/helpers'
import { eq } from 'drizzle-orm'

import { DrizzleDbAccessTokensProvider } from '#auth/token_providers/drizzle_db'
import { db } from '#core/services/db/main'
import { type User, users } from '#core/services/db/schema'

export class AccessTokensDrizzleUserProvider implements AccessTokensUserProviderContract<User> {
  declare [symbols.PROVIDER_REAL_USER]: User

  protected async getTokensProvider() {
    return DrizzleDbAccessTokensProvider.default()
  }

  createUserForGuard(user: User): Promise<AccessTokensGuardUser<User>> {
    const guard = {
      getId() {
        return user.id
      },
      getOriginal() {
        return user
      },
    }

    return Promise.resolve(guard)
  }

  async createToken(
    user: User,
    abilities?: string[] | undefined,
    options?: {
      name?: string
      expiresIn?: string | number
    }
  ): Promise<AccessToken> {
    const tokensProvider = await this.getTokensProvider()
    return tokensProvider.create(user, abilities, options)
  }

  /**
   * Invalidates a token identified by its publicly shared token
   *
   * @param tokenValue - The token value to invalidate
   *
   * @example
   * const wasInvalidated = await provider.invalidateToken(
   *   new Secret('oat_abc123.def456')
   * )
   * console.log('Token invalidated:', wasInvalidated)
   */
  async invalidateToken(tokenValue: Secret<string>) {
    const tokensProvider = await this.getTokensProvider()
    return tokensProvider.invalidate(tokenValue)
  }

  /**
   * Finds a user by the user id
   *
   * @param identifier - The user identifier to search for
   *
   * @example
   * const guardUser = await provider.findById(123)
   * if (guardUser) {
   *   const originalUser = guardUser.getOriginal()
   *   console.log('Found user:', originalUser.email)
   * }
   */
  async findById(identifier: number): Promise<AccessTokensGuardUser<User> | null> {
    const [user] = await db.select().from(users).where(eq(users.id, identifier))

    if (!user) {
      return null
    }

    return this.createUserForGuard(user)
  }

  /**
   * Verifies a publicly shared access token and returns an
   * access token for it.
   *
   * @param tokenValue - The token value to verify
   *
   * @example
   * const token = await provider.verifyToken(
   *   new Secret('oat_abc123.def456')
   * )
   * if (token && !token.isExpired()) {
   *   console.log('Valid token with abilities:', token.abilities)
   * }
   */
  async verifyToken(tokenValue: Secret<string>): Promise<AccessToken | null> {
    const tokensProvider = await this.getTokensProvider()
    return tokensProvider.verify(tokenValue)
  }
}
