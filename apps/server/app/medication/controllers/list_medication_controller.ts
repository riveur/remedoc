import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

import { MedicationRepository } from '#medication/repositories/medication_repository'
import { MedicationViewModel } from '#medication/view_models/medication_view_model'

@inject()
export default class ListMedicationController {
  constructor(private medicationRepository: MedicationRepository) {}

  async handle({ response, auth }: HttpContext) {
    const user = auth.use('api').getUserOrFail()

    const medications = await this.medicationRepository.findAll({ userId: user.id })

    return response.ok(
      medications.map((medication) => MedicationViewModel.fromDomain(medication).serialize())
    )
  }
}
