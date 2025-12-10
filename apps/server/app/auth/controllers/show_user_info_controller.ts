import type { HttpContext } from '@adonisjs/core/http'

import { UserViewModel } from '#auth/view_models/user_view_model'

export default class ShowUserInfoController {
  async handle({ auth, response }: HttpContext) {
    const user = auth.use('api').getUserOrFail()

    return response.json(UserViewModel.fromDomain(user).serialize())
  }
}
