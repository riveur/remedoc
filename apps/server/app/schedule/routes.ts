import router from '@adonisjs/core/services/router'

import { middleware } from '#start/kernel'

const ListScheduleController = () => import('#schedule/controllers/list_schedule_controller')
const AddScheduleController = () => import('#schedule/controllers/add_schedule_controller')
const ToggleActiveScheduleController = () =>
  import('#schedule/controllers/toggle_active_schedule_controller')
const DeleteScheduleController = () => import('#schedule/controllers/delete_schedule_controller')

router
  .group(() => {
    router
      .get('/medications/:medicationId/schedules', [ListScheduleController])
      .middleware(middleware.auth({ guards: ['api'] }))
    router
      .post('/medications/:medicationId/schedules', [AddScheduleController])
      .middleware(middleware.auth({ guards: ['api'] }))
    router
      .post('/medications/:medicationId/schedules/:scheduleId/archive', [
        ToggleActiveScheduleController,
      ])
      .middleware(middleware.auth({ guards: ['api'] }))
    router
      .delete('/medications/:medicationId/schedules/:scheduleId', [DeleteScheduleController])
      .middleware(middleware.auth({ guards: ['api'] }))
  })
  .prefix('/api')
