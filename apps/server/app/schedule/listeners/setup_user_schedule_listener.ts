import { JobScheduler } from '@nemoventures/adonis-jobs'
import { and, count, eq } from 'drizzle-orm'
import { Settings } from 'luxon'

import { db } from '#core/services/db/main'
import { medications, medicationSchedules } from '#core/services/db/schema'
import MedicationScheduleNotification, {
  type MedicationScheduleNotificationData,
} from '#jobs/medication_schedule_notification_job'

export default class SetupUserScheduleListener {
  async handle(options: MedicationScheduleNotificationData) {
    const [result] = await db
      .select({ value: count() })
      .from(medicationSchedules)
      .where(
        and(
          eq(medicationSchedules.active, true),
          eq(medicationSchedules.timeOfDay, options.timeOfDay)
        )
      )
      .innerJoin(
        medications,
        and(
          eq(medications.id, medicationSchedules.medicationId),
          eq(medications.active, true),
          eq(medications.userId, options.userId)
        )
      )

    const jobId = MedicationScheduleNotification.makeId(options)

    if (result.value === 0) {
      await JobScheduler.remove(jobId)
      return
    }

    const [hour, minutes] = options.timeOfDay.split(':')

    await JobScheduler.schedule({
      job: MedicationScheduleNotification,
      data: options,
      key: jobId,
      repeat: {
        pattern: `${minutes} ${hour} * * *`,
        tz: Settings.defaultLocale,
      },
    })
  }
}
