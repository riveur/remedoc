import { createInsertSchema, createUpdateSchema } from 'drizzle-zod'
import * as z from 'zod'

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

export const createMedicationScheduleSchema = createInsertSchema(medicationSchedules, {
  timeOfDay: z.iso.time(),
  daysOfWeek: z
    .array(z.number().min(1).max(7))
    .optional()
    .nullable()
    .transform((val) => (val ? val.join(',') : null)),
}).omit({
  id: true,
  active: true,
  createdAt: true,
  medicationId: true,
})
export const updateMedicationScheduleSchema = createUpdateSchema(medicationSchedules)

export const createMedicationLogSchema = createInsertSchema(medicationLogs)
export const updateMedicationLogSchema = createUpdateSchema(medicationLogs)
