import type { Medication } from '#core/services/db/schema'

export class MedicationViewModel {
  constructor(private medication: Medication) {}

  static fromDomain(medication: Medication) {
    return new this(medication)
  }

  serialize() {
    return {
      id: this.medication.id,
      name: this.medication.name,
      dosage: this.medication.dosage,
      instructions: this.medication.instructions,
      form: this.medication.form,
      active: this.medication.active,
      createdAt: this.medication.createdAt.toISOString(),
      updatedAt: this.medication.updatedAt.toISOString(),
    }
  }
}
