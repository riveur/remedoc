import { eq } from 'drizzle-orm'
import { DateTime } from 'luxon'

import { db } from '#core/services/db/main'
import {
  medicationSchedules,
  type MedicationSchedule,
  type NewMedicationSchedule,
} from '#core/services/db/schema'

export class MedicationScheduleRepository {
  async add(data: Omit<NewMedicationSchedule, 'createdAt' | 'active'>) {
    const [schedule] = await db.insert(medicationSchedules).values(data).returning()
    return schedule
  }

  async findById(scheduleId: number) {
    const [schedule] = await db
      .select()
      .from(medicationSchedules)
      .where(eq(medicationSchedules.id, scheduleId))
      .limit(1)
    return schedule
  }

  async findByMedication(medicationId: number) {
    return await db
      .select()
      .from(medicationSchedules)
      .where(eq(medicationSchedules.medicationId, medicationId))
      .orderBy(medicationSchedules.timeOfDay)
  }

  async update(
    id: number,
    data: Partial<Omit<NewMedicationSchedule, 'createdAt' | 'id' | 'medicationId'>>
  ) {
    const [updated] = await db
      .update(medicationSchedules)
      .set(data)
      .where(eq(medicationSchedules.id, id))
      .returning()
    return updated
  }

  async delete(id: number) {
    await db.delete(medicationSchedules).where(eq(medicationSchedules.id, id))
  }

  isScheduleActiveOnDate(schedule: MedicationSchedule, date: DateTime) {
    if (!schedule.daysOfWeek) {
      return true
    }

    const dayOfWeek = date.weekday
    const activeDays = schedule.daysOfWeek.split(',').map((d) => Number.parseInt(d))
    return activeDays.includes(dayOfWeek)
  }
}
