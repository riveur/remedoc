import { Client } from './app/client.js'
import config from './app/config.js'

const client = new Client({
  intents: [],
})

client.commands = new Map()

client.init(config.DISCORD_TOKEN)
