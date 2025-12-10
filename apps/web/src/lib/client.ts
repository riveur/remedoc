import { createClient } from '@repo/rpc/client'

import { useAuthTokenStore } from '@/features/auth/stores/auth_token_store'

export const client = createClient({
  baseUrl: import.meta.env.VITE_API_URL || window.location.origin,
  hooks: {
    beforeRequest: [
      (request) => {
        const token = useAuthTokenStore.getState().token
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`)
        }
      },
    ],
    afterResponse: [
      async (_, __, response) => {
        if (response.status === 401) {
          const content = await response.json<any>()
          if (content.code === 'E_UNAUTHORIZED_ACCESS') {
            useAuthTokenStore.getState().reset()
          }
        }
      },
    ],
  },
}).api
