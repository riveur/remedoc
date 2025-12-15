import type { Interaction } from 'discord.js'

import { type Client, defineEvent } from '../../app/client.js'
import { autocompleteHandler } from '../../handlers/autocomplete.js'
import { buttonHandler } from '../../handlers/button.js'
import { commandHandler } from '../../handlers/command.js'

export default defineEvent({
  name: 'interactionCreate',
  once: false,
  async execute(client: Client, interaction: Interaction) {
    switch (true) {
      case interaction.isCommand():
        await commandHandler(client, interaction)
        break
      case interaction.isAutocomplete():
        await autocompleteHandler(client, interaction)
        break
      case interaction.isButton():
        await buttonHandler(client, interaction)
        break
    }
  },
})
