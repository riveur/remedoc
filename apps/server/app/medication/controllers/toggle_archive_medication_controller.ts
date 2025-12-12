import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import emitter from '@adonisjs/core/services/emitter'
import { and, eq } from 'drizzle-orm'

import { db } from '#core/services/db/main'
import { medicationSchedules } from '#core/services/db/schema'
import { MedicationRepository } from '#medication/repositories/medication_repository'

@inject()
export default class ToggleArchiveMedicationController {
  constructor(private medicationRepository: MedicationRepository) {}

  async handle({ auth, response, params }: HttpContext) {
    const user = auth.use('api').getUserOrFail()

    const medication = await this.medicationRepository.findById(params.medicationId)

    if (!medication || medication?.userId !== user.id) {
      return response.notFound({ message: 'Médicament introuvable' })
    }

    await this.medicationRepository.update(medication.id, { active: !medication.active })

    const scheduleIds = await db
      .select({ id: medicationSchedules.id, timeOfDay: medicationSchedules.timeOfDay })
      .from(medicationSchedules)
      .where(
        and(
          eq(medicationSchedules.active, true),
          eq(medicationSchedules.medicationId, medication.id)
        )
      )

    await Promise.all(
      scheduleIds.map((schedule) =>
        emitter.emit('setup:user-schedule', { userId: user.id, timeOfDay: schedule.timeOfDay })
      )
    )

    return response.noContent()
  }
}
