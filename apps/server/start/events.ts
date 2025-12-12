import emitter from '@adonisjs/core/services/emitter'

import type { MedicationScheduleNotificationData } from '#jobs/medication_schedule_notification_job'
const SetupUserScheduleListener = () => import('#schedule/listeners/setup_user_schedule_listener')

emitter.on('setup:user-schedule', [SetupUserScheduleListener, 'handle'])

declare module '@adonisjs/core/types' {
  interface EventsList {
    'setup:user-schedule': MedicationScheduleNotificationData
  }
}
