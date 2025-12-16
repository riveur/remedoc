import { REST } from '@discordjs/rest'

import env from '#start/env'

export const discord = new REST({ version: '10' }).setToken(env.get('DISCORD_BOT_TOKEN'))
