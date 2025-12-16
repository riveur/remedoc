import { ContainerBuilder, SeparatorBuilder, TextDisplayBuilder } from '@discordjs/builders'
import { SeparatorSpacingSize } from '@discordjs/core'
import { DateTime } from 'luxon'

import { range } from '../utils/array.js'
import { lb } from '../utils/lb.js'

type Options = {
  data: Array<{
    schedule: {
      id: number
      medicationId: number
      timeOfDay: string
      daysOfWeek: number[] | null
      active: boolean
      notes: string | null
      createdAt: string
    }
    medication: {
      id: number
      name: string
      dosage: string | null
      form: string | null
      instructions: string | null
      active: boolean
      createdAt: string
      updatedAt: string
    }
  }>
}

export class PlanningScheduleComponent {
  #options: Options

  constructor(options: Options) {
    this.#options = options
  }

  static build(options: Options) {
    return new this(options)
  }

  render() {
    const { data } = this.#options

    const container = new ContainerBuilder()

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        lb(
          '## Planning de prise de medicaments',
          `Ci-dessous, retrouvez votre planning de la semaine :`
        )
      )
    )

    container.addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
    )

    const planning = range(1, 7).map((weekday) => {
      const formattedWeekday = DateTime.fromFormat(weekday.toString(), 'E').toFormat('EEEE', {
        locale: 'fr-FR',
      })!

      const schedules = data
        .filter((schedule) => {
          return !schedule.schedule.daysOfWeek || schedule.schedule.daysOfWeek.includes(weekday)
        })
        .map((schedule) => ({
          timeOfDay: schedule.schedule.timeOfDay,
          medication: schedule.medication,
        }))
        .toSorted((a, b) => {
          return DateTime.fromISO(a.timeOfDay).toMillis() - DateTime.fromISO(b.timeOfDay).toMillis()
        })

      return {
        weekday: formattedWeekday.charAt(0).toUpperCase() + formattedWeekday.slice(1),
        schedules,
      }
    })

    for (const [index, day] of planning.entries()) {
      container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`### ${day.weekday}`))

      if (day.schedules.length === 0) {
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent('Pas de médicaments à prendre pour ce jour.')
        )
      }

      for (const schedule of day.schedules) {
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            lb(
              `\`🕑 ${schedule.timeOfDay.slice(0, -3)}\` - **${schedule.medication.name}**` +
                (schedule.medication.dosage ? ` • \`${schedule.medication.dosage}\`` : '') +
                (schedule.medication.form ? ` • \`${schedule.medication.form}\`` : '')
            )
          )
        )
      }

      if (index < planning.length - 1) {
        container.addSeparatorComponents(
          new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
        )
      }
    }

    return container
  }
}
