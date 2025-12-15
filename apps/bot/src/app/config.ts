import { config as dotenvConfig } from 'dotenv'
dotenvConfig({ quiet: true })

export interface ClientConfig {
  DISCORD_TOKEN: string
  DISCORD_CLIENT_ID: string
  API_URL: string
  [key: string]: string
}

const clientConfig: ClientConfig = {
  DISCORD_TOKEN: process.env.DISCORD_TOKEN || '',
  DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID || '',
  API_URL: process.env.API_URL || '',
}

Object.keys(clientConfig).forEach((key) => {
  if (!clientConfig[key]) throw new Error(`${key} is not defined in the .env file`)
})

export default clientConfig
