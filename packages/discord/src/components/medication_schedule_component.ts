import {
  ActionRowBuilder,
  ButtonBuilder,
  ContainerBuilder,
  SectionBuilder,
  SeparatorBuilder,
  TextDisplayBuilder,
} from '@discordjs/builders'
import { ButtonStyle, MessageFlags, SeparatorSpacingSize } from '@discordjs/core'

import { lb } from '../utils/lb.js'

type Options = {
  timeOfDay: string
  data: Array<{
    schedule: {
      id: number
      medicationId: number
      timeOfDay: string
      daysOfWeek: string | null
      active: boolean
      notes: string | null
      createdAt: Date
    }
    medication: {
      id: number
      userId: number
      name: string
      dosage: string | null
      form: string | null
      instructions: string | null
      active: boolean
      createdAt: Date
      updatedAt: Date
    }
  }>
}

export class MedicationScheduleComponent {
  #options: Options

  constructor(options: Options) {
    this.#options = options
  }

  static build(options: Options) {
    return new this(options)
  }

  render() {
    const { timeOfDay, data } = this.#options

    const container = new ContainerBuilder()

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        lb(
          '## Rappel de prise de médicaments',
          `Bonjour, voici vos médicaments à prendre aujourd'hui à \`${timeOfDay.slice(0, -3)}\` :`
        )
      )
    )

    container.addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
    )

    data.forEach((item, index) => {
      const { medication, schedule } = item

      const section = new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            lb(
              `💊 **${medication.name}**` +
                (medication.dosage ? ` • \`${medication.dosage}\`` : '') +
                (medication.form ? ` • \`${medication.form}\`` : ''),
              medication.instructions ? `- **Instructions** : ${medication.instructions}` : null,
              schedule.notes ? `- **Note sur l'horaire** : ${schedule.notes}` : null
            )
          )
        )
        .setButtonAccessory(
          new ButtonBuilder()
            .setCustomId(`med_taken_${medication.id}_${schedule.id}`)
            .setLabel('Pris')
            .setStyle(ButtonStyle.Success)
        )

      container.addSectionComponents(section)

      if (index < data.length - 1) {
        container.addSeparatorComponents(
          new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
        )
      }
    })

    container.addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Large)
    )

    const actionRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('mark_all_taken')
        .setLabel('Tout marquer comme pris')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('view_schedule')
        .setLabel('Mon planning')
        .setStyle(ButtonStyle.Secondary)
    )

    container.addActionRowComponents(actionRow as any)

    // Footer
    const footer = new TextDisplayBuilder().setContent(
      `-# ${new Date().toLocaleDateString('fr-FR', { dateStyle: 'full' })}`
    )

    container.addTextDisplayComponents(footer)

    return {
      components: [container.toJSON()],
      flags: MessageFlags.IsComponentsV2,
    }
  }
}
