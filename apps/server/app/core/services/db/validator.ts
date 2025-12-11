import { createInsertSchema, createUpdateSchema } from 'drizzle-zod'

import { medicationLogs, medications, medicationSchedules } from '#core/services/db/schema'

export const createMedicationSchema = createInsertSchema(medications).omit({
  id: true,
  userId: true,
  active: true,
  createdAt: true,
  updatedAt: true,
})
export const updateMedicationSchema = createUpdateSchema(medications).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
})

export const createMedicationScheduleSchema = createInsertSchema(medicationSchedules)
export const updateMedicationScheduleSchema = createUpdateSchema(medicationSchedules)

export const createMedicationLogSchema = createInsertSchema(medicationLogs)
export const updateMedicationLogSchema = createUpdateSchema(medicationLogs)
