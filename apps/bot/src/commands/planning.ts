import { PlanningScheduleComponent } from '@repo/discord/components'
import { type ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js'

import { type Client, defineCommand } from '../app/client.js'
import { handleCommandError } from '../utils/command_error.js'
import { rpc } from '../utils/rpc.js'

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName('planning')
    .setDescription('Voir le planning de vos prises de médicaments de la semaine.'),
  async execute(_client: Client, interaction: ChatInputCommandInteraction) {
    await interaction.deferReply()

    const discordId = interaction.user.id

    const { data, error } = await rpc.discord({ discordId }).schedules.$get()

    if (error) {
      await handleCommandError(error, interaction)
      return
    }

    const container = PlanningScheduleComponent.build({ data })

    await interaction.followUp({
      components: [container.render()],
      flags: MessageFlags.IsComponentsV2,
    })
  },
})
