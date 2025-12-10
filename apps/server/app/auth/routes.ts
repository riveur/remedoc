import router from '@adonisjs/core/services/router'

import { middleware } from '#start/kernel'

const ShowUserInfoController = () => import('#auth/controllers/show_user_info_controller')
const DiscordCallbackController = () => import('#auth/controllers/discord_callback_controller')
const DiscordRedirectController = () => import('#auth/controllers/discord_redirect_controller')
const LogoutController = () => import('#auth/controllers/logout_controller')

router
  .group(() => {
    router.get('/me', [ShowUserInfoController]).middleware(middleware.auth({ guards: ['api'] }))
    router.get('/redirect', [DiscordRedirectController])
    router.get('/callback', [DiscordCallbackController])
    router.post('/logout', [LogoutController]).middleware(middleware.auth({ guards: ['api'] }))
  })
  .prefix('/api/auth')
