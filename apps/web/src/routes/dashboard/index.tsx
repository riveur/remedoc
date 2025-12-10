import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = Route.useRouteContext()

  return (
    <>
      <main className="min-h-dvh flex flex-col gap-4">
        <pre>{JSON.stringify(user, null, 2)}</pre>
      </main>
    </>
  )
}
