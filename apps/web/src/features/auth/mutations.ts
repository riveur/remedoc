import { useMutation } from '@tanstack/react-query'

import { client } from '@/lib/client'
import { handlePopup } from '@/lib/popup'
import { useAuthTokenStore } from './stores/auth_token_store'

export function useLoginMutation() {
  return useMutation({
    mutationFn: async () => {
      const result = await handlePopup<{ code: string; state: string }>(
        client.auth.redirect.$url(),
        'discord-auth',
        { timeout: 180000 }
      )

      if (result.status === 'success') {
        const tokenState = useAuthTokenStore.getState()

        const { data, error } = await client.auth.callback.$get({
          query: { code: result.data.code, state: result.data.state },
          credentials: 'include',
        })

        if (!error) {
          tokenState.init(data.token)
          return true
        }
      }

      return false
    },
  })
}
