import { createClient } from '@repo/rpc/client'

import clientConfig from '../app/config.js'

export const rpc = createClient({
  baseUrl: clientConfig.API_URL,
  hooks: {
    beforeRequest: [
      (request) => {
        request.headers.set('Authorization', `Bot ${clientConfig.DISCORD_TOKEN}`)
      },
    ],
  },
}).api
