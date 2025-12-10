import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

import { createMedicationSchema } from '#core/services/db/validator'
import { validateUsingZod } from '#core/utils'
import { MedicationRepository } from '#medication/repositories/medication_repository'
import { MedicationViewModel } from '#medication/view_models/medication_view_model'

@inject()
export default class CreateMedicationController {
  constructor(private medicationRepository: MedicationRepository) {}

  async handle({ request, response, auth }: HttpContext) {
    const user = auth.use('api').getUserOrFail()
    const payload = validateUsingZod({ schema: createMedicationSchema, data: request.all() })

    const medication = await this.medicationRepository.create({ ...payload, userId: user.id })

    return response.json(MedicationViewModel.fromDomain(medication).serialize())
  }
}
