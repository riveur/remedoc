import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import {
  Layout,
  LayoutDescription,
  LayoutHeader,
  LayoutTitle,
} from '@/features/dashboard/components/layout'
import { MedicationForm } from '@/features/medication/components/medication_form'
import { MedicationTable } from '@/features/medication/components/medication_table'
import { listMedicationQueryOptions } from '@/features/medication/queries'

export const Route = createFileRoute('/dashboard/medications')({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery(listMedicationQueryOptions())
  },
})

function RouteComponent() {
  const { data: medications } = useSuspenseQuery(listMedicationQueryOptions())

  return (
    <Layout>
      <LayoutHeader>
        <LayoutTitle>Liste des médicaments</LayoutTitle>
        <LayoutDescription>Ajoutez, modifiez, archivez comme vous le souhaitez.</LayoutDescription>
      </LayoutHeader>
      <MedicationTable data={medications} />
      <MedicationForm />
    </Layout>
  )
}
