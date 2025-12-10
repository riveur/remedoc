import { createFileRoute } from '@tanstack/react-router'

import {
  Layout,
  LayoutDescription,
  LayoutHeader,
  LayoutTitle,
} from '@/features/dashboard/components/layout'

export const Route = createFileRoute('/dashboard/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Layout>
      <LayoutHeader>
        <LayoutTitle>Vue d'ensemble</LayoutTitle>
        <LayoutDescription>Bienvenue sur le tableau de bord.</LayoutDescription>
      </LayoutHeader>
    </Layout>
  )
}
