import { ButtonInteraction } from 'discord.js'

import { LogLevel, type Client } from '../app/client.js'
import { buttons } from '../buttons/index.js'

export async function buttonHandler(client: Client, interaction: ButtonInteraction) {
  const button = buttons.find((b) => b.regex.test(interaction.customId))

  if (!button) {
    return client.logger(
      LogLevel.WARN,
      'InteractionButton',
      `Button ${interaction.customId} not found!`,
      interaction
    )
  }

  const matches = button.regex.exec(interaction.customId)

  try {
    await button.execute(client, interaction, matches?.groups)
  } catch (error) {
    client.logger(
      LogLevel.ERROR,
      'InteractionButton',
      `Error while executing button ${interaction.customId}`,
      error
    )
  }
}
