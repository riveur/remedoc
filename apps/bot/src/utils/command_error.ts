import { ErrorComponent } from '@repo/discord/components'
import { TuyauHTTPError } from '@repo/rpc/client'
import { ChatInputCommandInteraction, DiscordAPIError, MessageFlags } from 'discord.js'

// Le but est d'ajouter des erreurs de discord ici pour les gérer plus facilement
// elles seront mise à jour au fur et à mesure des erreurs possibles

export const DiscordErrors = {
  MISSING_PERMISSIONS: {
    code: 50013,
    message: "Le bot n'a pas les permissions nécessaire.",
  },
}

const ERROR_MESSAGES = new Map(
  Object.values(DiscordErrors).map((error) => [error.code, error.message])
)

export async function handleCommandError(
  error: unknown,
  interaction: ChatInputCommandInteraction
): Promise<void> {
  try {
    let message

    if (typeof error === 'string') {
      message = error
    } else if (error instanceof DiscordAPIError) {
      message = ERROR_MESSAGES.get(Number(error.code)) || `Erreur Discord: ${error.message}`
    } else if (error instanceof TuyauHTTPError) {
      if (typeof (error.value as any).message === 'string') {
        message = (error.value as any).message
      } else {
        message = error.message
      }
    } else {
      message = String(error)
    }

    const container = ErrorComponent.build({ message })

    await interaction.followUp({
      components: [container.render()],
      flags: MessageFlags.IsComponentsV2,
    })
  } catch (followUpError) {
    console.error("Erreur lors de l'envoi de la réponse d'erreur:", followUpError)
  }
}
