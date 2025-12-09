import { relations } from 'drizzle-orm'
import {
  boolean,
  date,
  integer,
  pgTable,
  serial,
  text,
  time,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'

export const medications = pgTable('medications', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  dosage: varchar('dosage', { length: 100 }),
  form: varchar('form', { length: 50 }),
  instructions: text('instructions'),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const medicationSchedules = pgTable('medication_schedules', {
  id: serial('id').primaryKey(),
  medicationId: integer('medication_id')
    .notNull()
    .references(() => medications.id, { onDelete: 'cascade' }),
  timeOfDay: time('time_of_day').notNull(),
  daysOfWeek: varchar('days_of_week', { length: 50 }),
  active: boolean('active').default(true).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const medicationLogs = pgTable('medication_logs', {
  id: serial('id').primaryKey(),
  medicationId: integer('medication_id')
    .notNull()
    .references(() => medications.id, { onDelete: 'cascade' }),
  scheduleId: integer('schedule_id').references(() => medicationSchedules.id, {
    onDelete: 'set null',
  }),
  scheduledDate: date('scheduled_date').notNull(),
  scheduledTime: time('scheduled_time').notNull(),
  takenAt: timestamp('taken_at'),
  taken: boolean('taken').default(false).notNull(),
  skipped: boolean('skipped').default(false).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const medicationsRelations = relations(medications, ({ many }) => ({
  schedules: many(medicationSchedules),
  logs: many(medicationLogs),
}))

export const medicationSchedulesRelations = relations(medicationSchedules, ({ one, many }) => ({
  medication: one(medications, {
    fields: [medicationSchedules.medicationId],
    references: [medications.id],
  }),
  logs: many(medicationLogs),
}))

export const medicationLogsRelations = relations(medicationLogs, ({ one }) => ({
  medication: one(medications, {
    fields: [medicationLogs.medicationId],
    references: [medications.id],
  }),
  schedule: one(medicationSchedules, {
    fields: [medicationLogs.scheduleId],
    references: [medicationSchedules.id],
  }),
}))

export type Medication = typeof medications.$inferSelect
export type NewMedication = typeof medications.$inferInsert

export type MedicationSchedule = typeof medicationSchedules.$inferSelect
export type NewMedicationSchedule = typeof medicationSchedules.$inferInsert

export type MedicationLog = typeof medicationLogs.$inferSelect
export type NewMedicationLog = typeof medicationLogs.$inferInsert
