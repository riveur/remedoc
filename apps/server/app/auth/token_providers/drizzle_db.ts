import { AccessToken } from '@adonisjs/auth/access_tokens'
import {
  AccessTokenDbColumns,
  AccessTokensProviderContract,
} from '@adonisjs/auth/types/access_tokens'
import { RuntimeException } from '@adonisjs/core/exceptions'
import type { Secret } from '@adonisjs/core/helpers'
import { and, desc, eq } from 'drizzle-orm'
import { inspect } from 'node:util'

import type { DrizzleDbAccessTokensProviderOptions } from '#auth/types'
import { db } from '#core/services/db/main'
import { authAccessTokens, User } from '#core/services/db/schema'

export class DrizzleDbAccessTokensProvider implements AccessTokensProviderContract<User> {
  /**
   * A unique type for the value. The type is used to identify a
   * bucket of tokens within the storage layer.
   *
   * Defaults to auth_token
   */
  protected type: string

  /**
   * A unique prefix to append to the publicly shared token value.
   *
   * Defaults to oat
   */
  protected prefix: string

  /**
   * Database table to use for querying access tokens
   */
  protected table: typeof authAccessTokens

  /**
   * The length for the token secret. A secret is a cryptographically
   * secure random string.
   */
  protected tokenSecretLength: number

  /**
   * Creates a new DbAccessTokensProvider instance
   *
   * @param options - Configuration options for the provider
   *
   * @example
   * const provider = new DrizzleDbAccessTokensProvider({
   *   table: 'auth_access_tokens',
   *   tokenSecretLength: 40,
   *   type: 'auth_token',
   *   prefix: 'oat_'
   * })
   */
  constructor(protected options: DrizzleDbAccessTokensProviderOptions) {
    this.table = authAccessTokens
    this.tokenSecretLength = options.tokenSecretLength || 40
    this.type = options.type || 'auth_token'
    this.prefix = options.prefix || 'oat_'
  }

  static default() {
    return new DrizzleDbAccessTokensProvider({ expiresIn: '14 days' })
  }

  /**
   * Check if value is an object
   */
  #isObject(value: unknown) {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
  }

  /**
   * Maps a database row to an AccessToken instance
   *
   * @param dbRow - The database row containing token data
   *
   * @example
   * const token = provider.dbRowToAccessToken({
   *   id: 1,
   *   tokenable_id: 123,
   *   type: 'auth_token',
   *   hash: 'sha256hash',
   *   // ... other columns
   * })
   */
  protected dbRowToAccessToken(dbRow: AccessTokenDbColumns): AccessToken {
    return new AccessToken({
      identifier: dbRow.id,
      tokenableId: dbRow.tokenable_id,
      type: dbRow.type,
      name: dbRow.name,
      hash: dbRow.hash,
      abilities: JSON.parse(dbRow.abilities),
      createdAt:
        typeof dbRow.created_at === 'number' ? new Date(dbRow.created_at) : dbRow.created_at,
      updatedAt:
        typeof dbRow.updated_at === 'number' ? new Date(dbRow.updated_at) : dbRow.updated_at,
      lastUsedAt:
        typeof dbRow.last_used_at === 'number' ? new Date(dbRow.last_used_at) : dbRow.last_used_at,
      expiresAt:
        typeof dbRow.expires_at === 'number' ? new Date(dbRow.expires_at) : dbRow.expires_at,
    })
  }

  /**
   * Returns a query client instance from the parent model
   *
   * @example
   * const db = await provider.getDb()
   * const tokens = await db.select().from(authAccessTokens)
   */
  protected async getDb() {
    return db
  }

  /**
   * Create a token for a user
   *
   * @param user - The user instance to create a token for
   * @param abilities - Array of abilities the token should have
   * @param options - Optional token configuration
   *
   * @example
   * const token = await provider.create(user, ['read', 'write'], {
   *   name: 'Mobile App Token',
   *   expiresIn: '7d'
   * })
   * console.log('Token:', token.value.release())
   */
  async create(
    user: User,
    abilities: string[] = ['*'],
    options?: {
      name?: string
      expiresIn?: string | number
    }
  ) {
    const queryClient = await this.getDb()

    /**
     * Creating a transient token. Transient token abstracts
     * the logic of creating a random secure secret and its
     * hash
     */
    const transientToken = AccessToken.createTransientToken(
      user.id,
      this.tokenSecretLength,
      options?.expiresIn || this.options.expiresIn
    )

    /**
     * Row to insert inside the database. We expect exactly these
     * columns to exist.
     */
    const dbRow: Omit<AccessTokenDbColumns, 'id'> = {
      tokenable_id: transientToken.userId,
      type: this.type,
      name: options?.name || null,
      hash: transientToken.hash,
      abilities: JSON.stringify(abilities),
      created_at: new Date(),
      updated_at: new Date(),
      last_used_at: null,
      expires_at: transientToken.expiresAt || null,
    }

    /**
     * Insert data to the database.
     */
    const result = await queryClient
      .insert(this.table)
      .values({ ...dbRow, tokenable_id: Number(dbRow.tokenable_id) })
      .returning()
    const id = this.#isObject(result[0]) ? result[0].id : null

    /**
     * Throw error when unable to find id in the return value of
     * the insert query
     */
    if (!id) {
      throw new RuntimeException(
        `Cannot save access token. The result "${inspect(result)}" of insert query is unexpected`
      )
    }

    /**
     * Convert db row to an access token
     */
    return new AccessToken({
      identifier: id,
      tokenableId: dbRow.tokenable_id,
      type: dbRow.type,
      prefix: this.prefix,
      secret: transientToken.secret,
      name: dbRow.name,
      hash: dbRow.hash,
      abilities: JSON.parse(dbRow.abilities),
      createdAt: dbRow.created_at,
      updatedAt: dbRow.updated_at,
      lastUsedAt: dbRow.last_used_at,
      expiresAt: dbRow.expires_at,
    })
  }

  /**
   * Find a token for a user by the token id
   *
   * @param user - The user instance that owns the token
   * @param identifier - The token identifier to search for
   *
   * @example
   * const token = await provider.find(user, 123)
   * if (token) {
   *   console.log('Found token:', token.name)
   * }
   */
  async find(user: User, identifier: number) {
    const queryClient = await this.getDb()
    const [dbRow] = await queryClient
      .select()
      .from(this.table)
      .where(
        and(
          eq(this.table.id, identifier),
          eq(this.table.tokenable_id, user.id),
          eq(this.table.type, this.type)
        )
      )
      .limit(1)

    if (!dbRow) {
      return null
    }

    return this.dbRowToAccessToken(dbRow)
  }

  /**
   * Delete a token by its id
   *
   * @param user - The user instance that owns the token
   * @param identifier - The token identifier to delete
   *
   * @example
   * const deletedCount = await provider.delete(user, 123)
   * console.log('Deleted tokens:', deletedCount)
   */
  async delete(user: User, identifier: number): Promise<number> {
    const queryClient = await this.getDb()
    const affectedRows = await queryClient
      .delete(this.table)
      .where(
        and(
          eq(this.table.id, identifier),
          eq(this.table.tokenable_id, user.id),
          eq(this.table.type, this.type)
        )
      )
      .returning({ id: this.table.id })

    return affectedRows.length
  }

  /**
   * Returns all the tokens for a given user
   *
   * @param user - The user instance to get tokens for
   *
   * @example
   * const tokens = await provider.all(user)
   * console.log('User has', tokens.length, 'tokens')
   * tokens.forEach(token => console.log(token.name))
   */
  async all(user: User) {
    const queryClient = await this.getDb()
    const dbRows = await queryClient
      .select()
      .from(this.table)
      .where(and(eq(this.table.tokenable_id, user.id), eq(this.table.type, this.type)))
      .orderBy(desc(this.table.last_used_at), desc(this.table.id))

    return dbRows.map((dbRow) => {
      return this.dbRowToAccessToken(dbRow)
    })
  }

  /**
   * Verifies a publicly shared access token and returns an
   * access token for it.
   *
   * Returns null when unable to verify the token or find it
   * inside the storage
   *
   * @param tokenValue - The token value to verify
   *
   * @example
   * const token = await provider.verify(new Secret('oat_abc123.def456'))
   * if (token && !token.isExpired()) {
   *   console.log('Valid token for user:', token.tokenableId)
   * }
   */
  async verify(tokenValue: Secret<string>) {
    const decodedToken = AccessToken.decode(this.prefix, tokenValue.release())
    if (!decodedToken) {
      return null
    }

    const queryClient = await this.getDb()
    const [dbRow] = await queryClient
      .select()
      .from(this.table)
      .where(
        and(eq(this.table.id, Number(decodedToken.identifier)), eq(this.table.type, this.type))
      )
      .limit(1)

    if (!dbRow) {
      return null
    }

    /**
     * Update last time the token is used
     */
    dbRow.last_used_at = new Date()
    await queryClient
      .update(this.table)
      .set({ last_used_at: dbRow.last_used_at })
      .where(and(eq(this.table.id, dbRow.id), eq(this.table.type, dbRow.type)))

    /**
     * Convert to access token instance
     */
    const accessToken = this.dbRowToAccessToken(dbRow)

    /**
     * Ensure the token secret matches the token hash
     */
    if (!accessToken.verify(decodedToken.secret) || accessToken.isExpired()) {
      return null
    }

    return accessToken
  }

  /**
   * Invalidates a token identified by its publicly shared token
   *
   * @param tokenValue - The token value to invalidate
   *
   * @example
   * const wasInvalidated = await provider.invalidate(new Secret('oat_abc123.def456'))
   * if (wasInvalidated) {
   *   console.log('Token successfully invalidated')
   * }
   */
  async invalidate(tokenValue: Secret<string>) {
    const decodedToken = AccessToken.decode(this.prefix, tokenValue.release())
    if (!decodedToken) {
      return false
    }

    const queryClient = await this.getDb()
    const rows = await queryClient
      .delete(this.table)
      .where(
        and(eq(this.table.id, Number(decodedToken.identifier)), eq(this.table.type, this.type))
      )
      .returning({ id: this.table.id })

    return Boolean(rows.length)
  }
}
