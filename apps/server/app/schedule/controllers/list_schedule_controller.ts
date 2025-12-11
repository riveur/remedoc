import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

import { MedicationRepository } from '#medication/repositories/medication_repository'
import { MedicationScheduleRepository } from '#schedule/repositories/medication_schedule_repository'
import { MedicationScheduleViewModel } from '#schedule/view_models/medication_schedule_view_model'

@inject()
export default class ListScheduleController {
  constructor(
    private scheduleRepository: MedicationScheduleRepository,
    private medicationRepository: MedicationRepository
  ) {}

  async handle({ auth, response, params }: HttpContext) {
    const user = auth.use('api').getUserOrFail()

    const medication = await this.medicationRepository.findById(params.medicationId)

    if (!medication || medication?.userId !== user.id) {
      return response.notFound({ message: 'Médicament introuvable' })
    }

    const schedules = await this.scheduleRepository.findByMedication(medication.id)

    return response.ok(
      schedules.map((schedule) => MedicationScheduleViewModel.fromDomain(schedule).serialize())
    )
  }
}
