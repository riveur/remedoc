import { createFileRoute } from '@tanstack/react-router'

import { ThemeToggler } from '@/components/shared/theme_toggler'
import { LoginForm } from '@/features/auth/components/login_form'
import { loginSearchSchema } from '@/features/auth/schemas/login_search_schema'
import { seo } from '@/lib/seo'

export const Route = createFileRoute('/_guest/')({
  head: () => ({ meta: [...seo({ title: 'Connexion' })] }),
  validateSearch: (search) => loginSearchSchema.parse(search),
  component: RouteComponent,
})

function RouteComponent() {
  const search = Route.useSearch()
  return (
    <>
      <main className="min-h-dvh w-full flex flex-col items-center justify-center gap-8">
        <div className="w-full max-w-sm">
          <LoginForm redirect={search.redirect} />
        </div>
      </main>
      <ThemeToggler className="fixed top-4 right-4" />
    </>
  )
}
