import { createFileRoute } from '@tanstack/react-router'

import { loginSearchSchema } from '@/features/auth/schemas/login_search_schema'

export const Route = createFileRoute('/_guest/auth/callback')({
  validateSearch: (search) => loginSearchSchema.parse(search),
  beforeLoad: async ({ search }) => {
    if (search.code && search.state && window.opener) {
      window.opener.postMessage(
        {
          type: 'discord-auth',
          data: {
            code: search.code,
            state: search.state,
          },
        },
        window.location.origin
      )
    }
  },
})
