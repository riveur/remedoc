import { createFileRoute, redirect } from '@tanstack/react-router'

import { Loading } from '@/components/shared/loading'
import { authQueryOptions } from '@/features/auth/queries'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async ({ context, location }) => {
    try {
      const user = await context.queryClient.ensureQueryData(authQueryOptions())
      return { user }
    } catch (_) {
      throw redirect({
        to: '/',
        search: {
          redirect: location.href,
        },
      })
    }
  },
  pendingComponent: () => (
    <main className="min-h-dvh flex items-center justify-center">
      <Loading />
    </main>
  ),
})
