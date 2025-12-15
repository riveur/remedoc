import chalk from 'chalk'
import { Client as DiscordClient, type ClientOptions } from 'discord.js'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import type { DefineButtonOptions, DefineCommandOptions, DefineEventOptions } from '../types.js'
import { paths } from '../utils/paths.js'

interface Command extends ReturnType<typeof defineCommand> {}

interface Event extends ReturnType<typeof defineEvent> {}

export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
  CUSTOM = 'CUSTOM',
}

export class Client extends DiscordClient {
  public commands: Map<string, Command>
  public cooldowns: Map<string, Map<string, number>>

  public constructor(options: ClientOptions) {
    super(options)
    this.commands = new Map()
    this.cooldowns = new Map()
  }

  public logger(level: LogLevel, prefix: string, message: string, ...optionalParams: any[]): void {
    const timestamp = new Date().toISOString()
    let formattedMessage = ''

    switch (level) {
      case LogLevel.INFO:
        formattedMessage = `${chalk.blue(`[${timestamp}] [${prefix}]`)} ${message}`
        break
      case LogLevel.WARN:
        formattedMessage = `${chalk.yellow(`[${timestamp}] [${prefix}]`)} ${message}`
        break
      case LogLevel.ERROR:
        formattedMessage = `${chalk.red(`[${timestamp}] [${prefix}]`)} ${message}`
        break
      case LogLevel.DEBUG:
        formattedMessage = `${chalk.green(`[${timestamp}] [${prefix}]`)} ${message}`
        break
      case LogLevel.CUSTOM:
        formattedMessage = `[${timestamp}] [${prefix}] ${message}`
        break
      default:
        formattedMessage = `[${timestamp}] [${prefix}] ${message}`
        break
    }

    console.log(formattedMessage, ...optionalParams)
  }

  public async loadCommands(): Promise<void> {
    const loadCommandsRecursively = (dir: string) => {
      const files = fs.readdirSync(dir)

      for (const file of files) {
        const filePath = path.join(dir, file)
        const stat = fs.statSync(filePath)

        if (stat.isDirectory()) {
          loadCommandsRecursively(filePath)
        } else if (file.endsWith('.js') || file.endsWith('.ts')) {
          const commandURL = pathToFileURL(filePath).href
          import(commandURL)
            .then((commandModule) => {
              if (commandModule && commandModule.default) {
                const command = commandModule.default as Command
                this.commands.set(command.data.name, command)
                this.logger(LogLevel.INFO, 'Commands', `Loaded command: ${command.data.name}`)
              } else {
                this.logger(
                  LogLevel.WARN,
                  'Commands',
                  `Command module at ${filePath} has no default export.`
                )
              }
            })
            .catch((err) => {
              this.logger(LogLevel.ERROR, 'Commands', `Failed to load command ${file}:`, err)
            })
        }
      }
    }

    loadCommandsRecursively(paths.commands)
  }

  public async loadEvents(): Promise<void> {
    const loadEventsRecursively = (dir: string) => {
      const files = fs.readdirSync(dir)

      for (const file of files) {
        const filePath = path.join(dir, file)
        const stat = fs.statSync(filePath)

        if (stat.isDirectory()) {
          loadEventsRecursively(filePath)
        } else if (file.endsWith('.js') || file.endsWith('.ts')) {
          const eventURL = pathToFileURL(filePath).href
          import(eventURL)
            .then((eventModule) => {
              if (eventModule && eventModule.default) {
                const event = eventModule.default as Event
                if (event.once) {
                  this.once(event.name, (...args) => event.execute(this as Client, ...args))
                } else {
                  this.on(event.name, (...args) => event.execute(this as Client, ...args))
                }
                this.logger(LogLevel.INFO, 'Events', `Loaded event: ${event.name}`)
              } else {
                this.logger(
                  LogLevel.WARN,
                  'Events',
                  `Event module at ${filePath} has no default export.`
                )
              }
            })
            .catch((err) => {
              this.logger(LogLevel.ERROR, 'Events', `Failed to load event ${file}:`, err)
            })
        }
      }
    }

    loadEventsRecursively(paths.events)
  }

  public init(token: string): void {
    this.loadCommands().catch((err) =>
      this.logger(LogLevel.ERROR, 'Init', 'Failed to load commands:', err)
    )
    this.loadEvents().catch((err) =>
      this.logger(LogLevel.ERROR, 'Init', 'Failed to load events:', err)
    )
    this.login(token).catch((err) => this.logger(LogLevel.ERROR, 'Init', 'Failed to login:', err))
  }
}

export function defineEvent(options: DefineEventOptions) {
  return options
}

export function defineCommand(options: DefineCommandOptions) {
  return options
}

export function defineButton(options: DefineButtonOptions) {
  return options
}
