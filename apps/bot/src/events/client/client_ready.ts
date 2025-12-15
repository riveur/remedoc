import { type Client, defineEvent, LogLevel } from '../../app/client.js'

export default defineEvent({
  name: 'clientReady',
  once: true,
  async execute(client: Client) {
    client.logger(LogLevel.INFO, 'Client', `Logged in as ${client.user?.tag}!`)
  },
})
