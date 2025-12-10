import { createFileRoute, redirect } from '@tanstack/react-router'

import { Loading } from '@/components/shared/loading'
import { authQueryOptions } from '@/features/auth/queries'
import { loginSearchSchema } from '@/features/auth/schemas/login_search_schema'

export const Route = createFileRoute('/_guest')({
  validateSearch: (search) => loginSearchSchema.pick({ redirect: true }).parse(search),
  beforeLoad: async ({ context, search }) => {
    let authenticated = false
    try {
      await context.queryClient.ensureQueryData(authQueryOptions())
      authenticated = true
    } catch {}

    if (authenticated) {
      throw redirect({
        to: search.redirect || '/dashboard',
      })
    }
  },
  pendingComponent: () => (
    <main className="min-h-dvh flex items-center justify-center">
      <Loading />
    </main>
  ),
})
