/**
 * Options accepted by the tokens provider that uses lucid
 * database service to fetch and persist tokens.
 */
export type DrizzleDbAccessTokensProviderOptions = {
  /**
   * The default expiry for all the tokens. You can also customize
   * expiry at the time of creating a token as well.
   *
   * By default tokens do not expire
   */
  expiresIn?: string | number

  /**
   * The length for the token secret. A secret is a cryptographically
   * secure random string.
   *
   * Defaults to 40
   */
  tokenSecretLength?: number

  /**
   * A unique type for the value. The type is used to identify a
   * bucket of tokens within the storage layer.
   *
   * Defaults to auth_token
   */
  type?: string

  /**
   * A unique prefix to append to the publicly shared token value.
   *
   * Defaults to oat_
   */
  prefix?: string
}
