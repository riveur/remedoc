import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

import { updateMedicationSchema } from '#core/services/db/validator'
import { validateUsingZod } from '#core/utils'
import { MedicationRepository } from '#medication/repositories/medication_repository'
import { MedicationViewModel } from '#medication/view_models/medication_view_model'

@inject()
export default class UpdateMedicationController {
  constructor(private medicationRepository: MedicationRepository) {}

  async handle({ request, response, auth, params }: HttpContext) {
    const user = auth.use('api').getUserOrFail()
    const payload = validateUsingZod({ schema: updateMedicationSchema, data: request.all() })

    const medication = await this.medicationRepository.findById(params.medicationId)

    if (!medication || medication?.userId !== user.id) {
      return response.notFound({ message: 'Médicament introuvable' })
    }

    const updated = await this.medicationRepository.update(medication.id, payload)

    return response.ok(MedicationViewModel.fromDomain(updated).serialize())
  }
}
