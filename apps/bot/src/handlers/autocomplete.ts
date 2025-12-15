import { AutocompleteInteraction } from 'discord.js'

import { type Client, LogLevel } from '../app/client.js'

export async function autocompleteHandler(client: Client, interaction: AutocompleteInteraction) {
  const command = client.commands.get(interaction.commandName)

  if (!command || !command.autocomplete)
    return client.logger(
      LogLevel.WARN,
      'InteractionAutocomplete',
      `Command ${interaction.commandName} not found or does not have an autocomplete method!`,
      interaction
    )

  try {
    await command.autocomplete(client, interaction)
  } catch (error) {
    client.logger(
      LogLevel.ERROR,
      'InteractionAutocomplete',
      `Error while executing autocomplete for command ${interaction.commandName}`,
      error
    )
    await interaction
      .respond([
        {
          name: 'There was an error while executing this command!',
          value: 'error',
        },
      ])
      .catch(console.error)
  }
}
