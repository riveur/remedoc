/* eslint-disable @unicorn/filename-case */
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArchiveIcon, ArchiveRestoreIcon, ArrowLeftIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import {
  Layout,
  LayoutDescription,
  LayoutHeader,
  LayoutTitle,
} from '@/features/dashboard/components/layout'
import { MedicationEditForm } from '@/features/medication/components/medication_edit_form'
import { useToggleArchiveMedicationMutation } from '@/features/medication/mutations'
import { showMedicationQueryOptions } from '@/features/medication/queries'

export const Route = createFileRoute('/dashboard/medications_/$medicationId')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await context.queryClient.prefetchQuery(showMedicationQueryOptions(Number(params.medicationId)))
  },
})

function RouteComponent() {
  const { medicationId } = Route.useParams()
  const { data: medication } = useSuspenseQuery(showMedicationQueryOptions(Number(medicationId)))
  const { mutate: toggleArchive, isPending: toggleArchiveIsPending } =
    useToggleArchiveMedicationMutation(medication.active)

  return (
    <Layout>
      <LayoutHeader>
        <LayoutTitle>Médicament #{medication.id}</LayoutTitle>
        <LayoutDescription>
          Consultez les détails du médicament et apportez des modications si nécessaire.
        </LayoutDescription>
      </LayoutHeader>
      <Field orientation="horizontal" className="justify-between">
        <Button variant="secondary" render={<Link to="/dashboard/medications" />}>
          <ArrowLeftIcon />
          Retour à la liste
        </Button>
        <Button
          variant="secondary"
          disabled={toggleArchiveIsPending}
          onClick={() => toggleArchive(medication.id)}
        >
          {medication.active ? <ArchiveIcon /> : <ArchiveRestoreIcon />}
          {medication.active ? 'Archiver' : 'Restaurer'}
        </Button>
      </Field>
      <MedicationEditForm medication={medication} />
    </Layout>
  )
}
