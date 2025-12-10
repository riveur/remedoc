import router from '@adonisjs/core/services/router'

import { middleware } from '#start/kernel'

const AddScheduleController = () => import('#schedule/controllers/add_schedule_controller')

router
  .group(() => {
    router
      .post('/medications/:medicationId/schedules', [AddScheduleController])
      .middleware(middleware.auth({ guards: ['api'] }))
  })
  .prefix('/api')
