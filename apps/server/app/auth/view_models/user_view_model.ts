import type { User } from '#core/services/db/schema'

export class UserViewModel {
  constructor(private user: User) {}

  static fromDomain(user: User) {
    return new this(user)
  }

  serialize() {
    return {
      id: this.user.id,
      discordId: this.user.discordId,
      username: this.user.username,
      avatarUrl: this.user.avatarUrl,
      createdAt: this.user.createdAt.toISOString(),
      updatedAt: this.user.updatedAt.toISOString(),
    }
  }
}
