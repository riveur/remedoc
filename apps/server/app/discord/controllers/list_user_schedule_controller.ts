import type { HttpContext } from '@adonisjs/core/http'
import { and, eq } from 'drizzle-orm'

import { db } from '#core/services/db/main'
import { medications, medicationSchedules, users } from '#core/services/db/schema'
import { MedicationViewModel } from '#medication/view_models/medication_view_model'
import { MedicationScheduleViewModel } from '#schedule/view_models/medication_schedule_view_model'

export default class ListUserScheduleController {
  async handle({ response, params }: HttpContext) {
    const [user] = await db
      .select({ id: users.id, discordId: users.discordId })
      .from(users)
      .where(eq(users.discordId, params.discordId))
      .limit(1)

    if (!user) {
      return response.notFound({ message: 'Utilisateur introuvable' })
    }

    let result = await db
      .select({
        schedule: medicationSchedules,
        medication: medications,
      })
      .from(medicationSchedules)
      .where(eq(medicationSchedules.active, true))
      .innerJoin(
        medications,
        and(
          eq(medications.id, medicationSchedules.medicationId),
          eq(medications.active, true),
          eq(medications.userId, user.id)
        )
      )

    return response.ok(
      result.map((item) => ({
        schedule: MedicationScheduleViewModel.fromDomain(item.schedule).serialize(),
        medication: MedicationViewModel.fromDomain(item.medication).serialize(),
      }))
    )
  }
}
