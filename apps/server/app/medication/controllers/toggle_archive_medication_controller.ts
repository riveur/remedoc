import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

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

    return response.noContent()
  }
}
