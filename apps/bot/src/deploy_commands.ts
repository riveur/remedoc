import { REST, Routes } from 'discord.js'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import './app/config.js'
import { paths } from './utils/paths.js'

const commands: any[] = []

const loadCommandsRecursively = async (dir: string) => {
  const files = fs.readdirSync(dir)

  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      await loadCommandsRecursively(filePath)
    } else if (file.endsWith('.ts') || file.endsWith('.js')) {
      const fileUrl = pathToFileURL(filePath).href
      await import(fileUrl)
        .then((commandModule) => {
          const command = commandModule.default

          if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON())
          }
        })
        .catch((err) => {
          console.error(`Failed to load command ${file}:`, err)
        })
    }
  }
}

await loadCommandsRecursively(paths.commands)

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!)

void (async () => {
  try {
    console.log('Déploiement des nouvelles commandes...')

    await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID!), {
      body: commands,
    })

    console.log('Commandes globales déployées avec succès.')
  } catch (error) {
    console.error('Erreur lors du déploiement des commandes:', error)
  }
})()
