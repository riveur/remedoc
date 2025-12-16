import router from '@adonisjs/core/services/router'

import { middleware } from '#start/kernel'

const ListUserScheduleController = () =>
  import('#discord/controllers/list_user_schedule_controller')

router
  .group(() => {
    router.get('/:discordId/schedules', [ListUserScheduleController])
  })
  .prefix('/api/discord')
  .middleware(middleware.discordBot())
