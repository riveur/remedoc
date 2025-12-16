import { Job } from '@nemoventures/adonis-jobs'
import type { BullJobsOptions } from '@nemoventures/adonis-jobs/types'
import { type APIChannel, Routes } from 'discord-api-types/v10'
import { and, eq } from 'drizzle-orm'
import { DateTime } from 'luxon'

import { db } from '#core/services/db/main'
import { medications, medicationSchedules, users } from '#core/services/db/schema'
import { discord } from '#discord/services/main'
import { MedicationScheduleComponent } from '@repo/discord/components'

export type MedicationScheduleNotificationData = {
  userId: number
  timeOfDay: string
}

export type MedicationScheduleNotificationReturn = {
  message: string
  ok: boolean
}

export default class MedicationScheduleNotification extends Job<
  MedicationScheduleNotificationData,
  MedicationScheduleNotificationReturn
> {
  static options: BullJobsOptions = {}

  static makeId(options: MedicationScheduleNotificationData) {
    return `medication-schedule,user(${options.userId}),hour(${options.timeOfDay})`
  }

  async process(): Promise<MedicationScheduleNotificationReturn> {
    const [user] = await db.select().from(users).where(eq(users.id, this.data.userId)).limit(1)

    if (!user) {
      return {
        message: `Utilisateur #${this.data.userId} introuvable.`,
        ok: false,
      }
    }

    let result = await db
      .select({
        schedule: medicationSchedules,
        medication: medications,
      })
      .from(medicationSchedules)
      .where(
        and(
          eq(medicationSchedules.timeOfDay, this.data.timeOfDay),
          eq(medicationSchedules.active, true)
        )
      )
      .innerJoin(
        medications,
        and(
          eq(medications.id, medicationSchedules.medicationId),
          eq(medications.active, true),
          eq(medications.userId, this.data.userId)
        )
      )

    const weekday = DateTime.now().weekday

    result = result.filter((item) => {
      const days = item.schedule.daysOfWeek?.split(',').map((day) => Number.parseInt(day)) || []
      return days.length === 0 || days.includes(weekday)
    })

    if (result.length === 0) {
      return {
        message: `Aucun horaire configuré à ${this.data.timeOfDay} pour l'utilisateur #${user.id}`,
        ok: true,
      }
    }

    const component = MedicationScheduleComponent.build({
      data: result,
      timeOfDay: this.data.timeOfDay,
    })

    const channel = (await discord.post(Routes.userChannels(), {
      body: { recipient_id: user.discordId },
    })) as APIChannel

    await discord.post(Routes.channelMessages(channel.id), { body: component.render() })

    return {
      message: 'Notification envoyé !',
      ok: true,
    }
  }
}
