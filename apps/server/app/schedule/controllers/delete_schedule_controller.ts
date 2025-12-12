import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import emitter from '@adonisjs/core/services/emitter'

import { MedicationRepository } from '#medication/repositories/medication_repository'
import { MedicationScheduleRepository } from '#schedule/repositories/medication_schedule_repository'

@inject()
export default class DeleteScheduleController {
  constructor(
    private medicationRepository: MedicationRepository,
    private scheduleRepository: MedicationScheduleRepository
  ) {}

  async handle({ auth, response, params }: HttpContext) {
    const user = auth.use('api').getUserOrFail()

    const medication = await this.medicationRepository.findById(params.medicationId)

    if (!medication || medication?.userId !== user.id) {
      return response.notFound({ message: 'Medicament introuvable' })
    }

    const schedule = await this.scheduleRepository.findById(params.scheduleId)

    if (!schedule || schedule?.medicationId !== medication.id) {
      return response.notFound({ message: 'Horaire introuvable' })
    }

    await this.scheduleRepository.delete(schedule.id)

    await emitter.emit('setup:user-schedule', { userId: user.id, timeOfDay: schedule.timeOfDay })

    return response.noContent()
  }
}
