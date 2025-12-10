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

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  discordId: varchar('discord_id', { length: 50 }).notNull().unique(),
  username: varchar('username', { length: 100 }).notNull(),
  avatarUrl: varchar('avatar_url', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const authAccessTokens = pgTable('auth_access_tokens', {
  id: serial('id').primaryKey(),
  tokenable_id: integer('tokenable_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }),
  hash: varchar('hash', { length: 255 }).notNull(),
  abilities: text('abilities').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  last_used_at: timestamp('last_used_at'),
  expires_at: timestamp('expires_at'),
})

export const userPreferences = pgTable('user_preferences', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  notificationDelay: integer('notification_delay').default(60).notNull(),
  notificationsEnabled: boolean('notifications_enabled').default(true).notNull(),
})

export const discordTokens = pgTable('discord_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const medications = pgTable('medications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
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
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
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

export const usersRelations = relations(users, ({ many, one }) => ({
  medications: many(medications),
  logs: many(medicationLogs),
  discordToken: one(discordTokens),
}))

export const medicationsRelations = relations(medications, ({ one, many }) => ({
  user: one(users, {
    fields: [medications.userId],
    references: [users.id],
  }),
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
  user: one(users, {
    fields: [medicationLogs.userId],
    references: [users.id],
  }),
  medication: one(medications, {
    fields: [medicationLogs.medicationId],
    references: [medications.id],
  }),
  schedule: one(medicationSchedules, {
    fields: [medicationLogs.scheduleId],
    references: [medicationSchedules.id],
  }),
}))

export const discordTokensRelations = relations(discordTokens, ({ one }) => ({
  user: one(users, {
    fields: [discordTokens.userId],
    references: [users.id],
  }),
}))

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type Medication = typeof medications.$inferSelect
export type NewMedication = typeof medications.$inferInsert

export type MedicationSchedule = typeof medicationSchedules.$inferSelect
export type NewMedicationSchedule = typeof medicationSchedules.$inferInsert

export type MedicationLog = typeof medicationLogs.$inferSelect
export type NewMedicationLog = typeof medicationLogs.$inferInsert

export type DiscordToken = typeof discordTokens.$inferSelect
export type NewDiscordToken = typeof discordTokens.$inferInsert
