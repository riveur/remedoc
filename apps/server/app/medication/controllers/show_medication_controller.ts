import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

import { MedicationRepository } from '#medication/repositories/medication_repository'
import { MedicationViewModel } from '#medication/view_models/medication_view_model'

@inject()
export default class ShowMedicationController {
  constructor(private medicationRepository: MedicationRepository) {}

  async handle({ auth, response, params }: HttpContext) {
    const user = auth.use('api').getUserOrFail()

    const medication = await this.medicationRepository.findById(params.medicationId)

    if (!medication || medication?.userId !== user.id) {
      return response.notFound({ message: 'Médicament introuvable' })
    }

    return response.ok(MedicationViewModel.fromDomain(medication).serialize())
  }
}
