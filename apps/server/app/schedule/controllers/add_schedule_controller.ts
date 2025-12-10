import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

import { createMedicationScheduleSchema } from '#core/services/db/validator'
import { validateUsingZod } from '#core/utils'
import { MedicationRepository } from '#medication/repositories/medication_repository'
import { MedicationScheduleRepository } from '#schedule/repositories/medication_schedule_repository'
import { MedicationScheduleViewModel } from '#schedule/view_models/medication_schedule_view_model'

@inject()
export default class AddScheduleController {
  constructor(
    private medicationRepository: MedicationRepository,
    private medicationScheduleRepository: MedicationScheduleRepository
  ) {}

  async handle({ params, request, response, auth }: HttpContext) {
    const user = auth.use('api').getUserOrFail()
    const payload = validateUsingZod({
      schema: createMedicationScheduleSchema,
      data: request.all(),
    })

    const medication = await this.medicationRepository.findById(Number(params.medicationId))

    if (!medication || medication?.userId !== user.id) {
      return response.notFound({ message: 'Médicament introuvable' })
    }

    const schedule = await this.medicationScheduleRepository.add({
      ...payload,
      medicationId: medication.id,
    })

    return response.json(MedicationScheduleViewModel.fromDomain(schedule).serialize())
  }
}
