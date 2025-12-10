/**
 * Interface pour les options de la popup
 */
interface PopupOptions {
  width?: number
  height?: number
  title?: string
  timeout?: number
  centered?: boolean
}

/**
 * Interface pour les messages attendus de la popup
 */
interface PopupMessage<T> {
  type: string
  data: T
}

/**
 * Résultat de l'opération de popup
 */
type PopupResult<T> =
  | { status: 'success'; data: T }
  | { status: 'closed'; reason: 'user_closed' | 'timeout' | 'blocked' }

/**
 * Gère une popup et retourne une promesse qui sera résolue/rejetée selon le résultat
 * @param url URL à ouvrir dans la popup
 * @param messageType Type de message attendu pour la résolution
 * @param options Options de configuration de la popup
 * @returns Une promesse avec le résultat de l'opération
 */
export function handlePopup<T>(
  url: string,
  messageType: string,
  options: PopupOptions = {}
): Promise<PopupResult<T>> {
  return new Promise((resolve) => {
    // Options par défaut
    const {
      width = 600,
      height = 800,
      title = 'Popup',
      timeout = 120000, // 2 minutes par défaut
      centered = true,
    } = options

    // Calcul de la position de la popup
    let left
    let top
    if (centered) {
      left = window.screenX + (window.outerWidth - width) / 2
      top = window.screenY + (window.outerHeight - height) / 2
    } else {
      left = window.screenX + 50
      top = window.screenY + 50
    }

    // Configuration de la popup
    const popupOptions = `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`

    // Ouvrir la popup
    const popup = window.open(url, title, popupOptions)

    // Vérifier si la popup a été bloquée
    if (!popup) {
      return resolve({
        status: 'closed',
        reason: 'blocked',
      })
    }

    // Gestionnaire pour l'écouteur d'événements message
    const messageHandler = (event: MessageEvent) => {
      try {
        // Vérifier l'origine et le type du message
        if (event.origin !== window.location.origin) return

        const message = event.data as PopupMessage<T>

        if (
          message &&
          typeof message === 'object' &&
          'type' in message &&
          message.type === messageType
        ) {
          // Succès : message attendu reçu
          cleanup()
          popup.close()

          resolve({
            status: 'success',
            data: message.data,
          })
        }
      } catch (error) {
        // Ignorer les messages mal formatés
        console.error('Erreur lors du traitement du message:', error)
      }
    }

    // Configuration d'un intervalle pour vérifier si la popup est fermée
    let checkClosedInterval: number | null = null

    // Configuration d'un timeout pour l'opération
    let timeoutId: number | null = null

    // Fonction pour nettoyer tous les écouteurs et timers
    const cleanup = () => {
      window.removeEventListener('message', messageHandler)

      if (checkClosedInterval !== null) {
        clearInterval(checkClosedInterval)
        checkClosedInterval = null
      }

      if (timeoutId !== null) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
    }

    // Ajouter l'écouteur d'événements
    window.addEventListener('message', messageHandler)

    // Configurer l'intervalle pour vérifier si la popup est fermée
    checkClosedInterval = window.setInterval(() => {
      if (popup.closed) {
        cleanup()
        resolve({
          status: 'closed',
          reason: 'user_closed',
        })
      }
    }, 500)

    // Configurer le timeout
    if (timeout > 0) {
      timeoutId = window.setTimeout(() => {
        if (!popup.closed) {
          popup.close()
        }
        cleanup()
        resolve({
          status: 'closed',
          reason: 'timeout',
        })
      }, timeout)
    }
  })
}
