import { SlashCommandBuilder, type ChatInputCommandInteraction } from 'discord.js'

import { type Client, defineCommand } from '../app/client.js'

export default defineCommand({
  data: new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!'),
  async execute(_: Client, interaction: ChatInputCommandInteraction) {
    await interaction.reply('Pong! 🏓')
  },
})
