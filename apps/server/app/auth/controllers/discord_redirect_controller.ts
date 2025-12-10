import type { HttpContext } from '@adonisjs/core/http'

export default class DiscordRedirectController {
  async handle({ ally }: HttpContext) {
    return ally.use('discord').redirect()
  }
}
