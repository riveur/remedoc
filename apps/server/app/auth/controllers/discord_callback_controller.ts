import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

import { DrizzleDbAccessTokensProvider } from '#auth/token_providers/drizzle_db'
import { db } from '#core/services/db/main'
import { discordTokens, users } from '#core/services/db/schema'

export default class DiscordCallbackController {
  async handle({ response, ally }: HttpContext) {
    const discord = ally.use('discord')

    if (discord.accessDenied()) {
      return response.unauthorized({ message: "Vous avez annulé le processus d'authentification." })
    }

    if (discord.stateMisMatch()) {
      return response.badRequest({
        message: 'Nous avons pas pu vérifier la requête, veuillez réessayer.',
      })
    }

    if (discord.hasError()) {
      return response.badRequest({
        message: `Une erreur est survenue: ${discord.getError() || 'Inconnue'}`,
      })
    }

    const discordUser = await discord.user()

    const result = await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({
          discordId: discordUser.id,
          username: discordUser.original.global_name ?? discordUser.nickName,
          avatarUrl: discordUser.avatarUrl,
        })
        .onConflictDoUpdate({
          target: users.discordId,
          set: {
            username: discordUser.original.global_name ?? discordUser.nickName,
            avatarUrl: discordUser.avatarUrl,
            updatedAt: DateTime.now().toJSDate(),
          },
        })
        .returning()

      await tx
        .insert(discordTokens)
        .values({
          userId: user.id,
          accessToken: discordUser.token.token,
          refreshToken: discordUser.token.refreshToken,
          expiresAt: discordUser.token.expiresAt,
        })
        .onConflictDoUpdate({
          target: discordTokens.userId,
          set: {
            accessToken: discordUser.token.token,
            refreshToken: discordUser.token.refreshToken,
            expiresAt: discordUser.token.expiresAt,
            updatedAt: DateTime.now().toJSDate(),
          },
        })

      return { user }
    })

    const token = await DrizzleDbAccessTokensProvider.default().create(result.user)

    return response.ok({ type: token.type, token: token.value!.release() })
  }
}
