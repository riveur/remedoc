import type {
  AutocompleteInteraction,
  ButtonInteraction,
  ChatInputCommandInteraction,
  ClientEvents,
  Interaction,
  SharedSlashCommand,
} from 'discord.js'

import type { Client } from './app/client.js'

export type DefineEventOptions = {
  name: keyof ClientEvents
  once: boolean
  execute: (client: Client, ...args: any[]) => Promise<void>
}

type CommandExecute =
  | ((client: Client, interaction: ChatInputCommandInteraction) => Promise<void>)
  | ((client: Client, interaction: Interaction) => Promise<void>)

export type DefineCommandOptions = {
  data: SharedSlashCommand
  execute: CommandExecute
  autocomplete?: (client: Client, interaction: AutocompleteInteraction) => Promise<void>
}

export type DefineButtonOptions = {
  regex: RegExp
  execute: (
    client: Client,
    interaction: ButtonInteraction,
    match?: Record<string, string>
  ) => Promise<void>
}
