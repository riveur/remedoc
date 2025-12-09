import { inject } from '@adonisjs/core'
import { and, eq } from 'drizzle-orm'
import { DateTime } from 'luxon'

import { db } from '#core/services/db/main'
import {
  medicationLogs,
  medications,
  medicationSchedules,
  type NewMedicationLog,
} from '#core/services/db/schema'
import { MedicationScheduleRepository } from '#schedule/repositories/medication_schedule_repository'

@inject()
export class MedicationLogRepository {
  constructor(private medicationScheduleRepository: MedicationScheduleRepository) {}

  async generateForDate(date: DateTime) {
    const formattedDate = date.toISODate()

    if (!formattedDate) {
      throw new Error('Date invalide')
    }

    const activeSchedules = await db
      .select({
        schedule: medicationSchedules,
        medication: medications,
      })
      .from(medicationSchedules)
      .innerJoin(medications, eq(medicationSchedules.medicationId, medications.id))
      .where(and(eq(medicationSchedules.active, true), eq(medications.active, true)))

    const logsToCreate: NewMedicationLog[] = []

    for (const { schedule, medication } of activeSchedules) {
      if (!this.medicationScheduleRepository.isScheduleActiveOnDate(schedule, date)) {
        continue
      }

      const existingLog = await db
        .select()
        .from(medicationLogs)
        .where(
          and(
            eq(medicationLogs.scheduleId, schedule.id),
            eq(medicationLogs.scheduledDate, formattedDate)
          )
        )
        .limit(1)

      if (existingLog.length === 0) {
        logsToCreate.push({
          medicationId: medication.id,
          scheduleId: schedule.id,
          scheduledDate: formattedDate,
          scheduledTime: schedule.timeOfDay,
          taken: false,
          skipped: false,
        })
      }
    }

    if (logsToCreate.length > 0) {
      await db.insert(medicationLogs).values(logsToCreate)
    }

    return logsToCreate.length
  }

  async generateForNextDays(days = 7) {
    let totalGenerated = 0
    const today = DateTime.now().startOf('day')

    for (let i = 0; i < days; i++) {
      const date = today.plus({ days: i })
      const count = await this.generateForDate(date)
      totalGenerated += count
    }

    return totalGenerated
  }

  async markAsTaken(logId: number, notes?: string) {
    const [updated] = await db
      .update(medicationLogs)
      .set({
        taken: true,
        skipped: false,
        takenAt: DateTime.now().toJSDate(),
        notes: notes || undefined,
      })
      .where(eq(medicationLogs.id, logId))
      .returning()
    return updated
  }

  async markAsSkipped(logId: number, notes?: string) {
    const [updated] = await db
      .update(medicationLogs)
      .set({
        taken: false,
        skipped: true,
        takenAt: null,
        notes: notes || undefined,
      })
      .where(eq(medicationLogs.id, logId))
      .returning()
    return updated
  }

  async undo(logId: number) {
    const [updated] = await db
      .update(medicationLogs)
      .set({
        taken: false,
        skipped: false,
        takenAt: null,
      })
      .where(eq(medicationLogs.id, logId))
      .returning()
    return updated
  }

  async addNote(logId: number, notes: string) {
    const [updated] = await db
      .update(medicationLogs)
      .set({ notes })
      .where(eq(medicationLogs.id, logId))
      .returning()
    return updated
  }
}
