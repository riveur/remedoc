import { Exception } from '@adonisjs/core/exceptions'
import { safeEqual } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

import env from '#start/env'

export default class DiscordBotMiddleware {
  protected authorizationPrefix = 'Bot '

  async handle(ctx: HttpContext, next: NextFn) {
    const authorization = ctx.request.header('Authorization', '')!
    const token = authorization.replace(this.authorizationPrefix, '')

    const equals = safeEqual(env.get('DISCORD_BOT_TOKEN'), token)

    if (!equals) {
      throw new Exception('Unauthorized access', {
        code: 'E_DISCORD_BOT_UNAUTHORIZED',
        status: 403,
      })
    }

    return next()
  }
}
