import type { MedicationSchedule } from '#core/services/db/schema'

export class MedicationScheduleViewModel {
  constructor(private schedule: MedicationSchedule) {}

  static fromDomain(schedule: MedicationSchedule) {
    return new this(schedule)
  }

  serialize() {
    return {
      id: this.schedule.id,
      medicationId: this.schedule.medicationId,
      timeOfDay: this.schedule.timeOfDay,
      daysOfWeek: this.schedule.daysOfWeek
        ? this.schedule.daysOfWeek.split(',').map((value) => Number.parseInt(value))
        : null,
      active: this.schedule.active,
      notes: this.schedule.notes,
      createdAt: this.schedule.createdAt.toISOString(),
    }
  }
}
