import { ChatInputCommandInteraction, CommandInteraction } from 'discord.js'

import { type Client, LogLevel } from '../app/client.js'

export async function commandHandler(client: Client, interaction: CommandInteraction) {
  const command = client.commands.get(interaction.commandName)

  if (!command)
    return client.logger(
      LogLevel.WARN,
      'InteractionCommand',
      `Command ${interaction.commandName} not found!`,
      interaction
    )

  try {
    await command.execute(client, interaction as ChatInputCommandInteraction)
  } catch (error) {
    client.logger(
      LogLevel.ERROR,
      'InteractionCommand',
      `Error while executing command ${interaction.commandName}`,
      error
    )
    await interaction
      .reply({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      })
      .catch(console.error)
  }
}
