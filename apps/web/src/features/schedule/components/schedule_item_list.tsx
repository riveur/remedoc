import { useQuery } from '@tanstack/react-query'
import { ClockAlertIcon, RefreshCcwIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { ItemGroup } from '@/components/ui/item'
import { listMedicationScheculeQueryOptions } from '../queries'
import { ScheduleItem, ScheduleItemSkeleton } from './schedule_item'

interface ScheduleItemListProps {
  medicationId: number
}

export function ScheduleItemList({ medicationId }: ScheduleItemListProps) {
  const { data, isPending, isError, refetch } = useQuery(
    listMedicationScheculeQueryOptions(medicationId)
  )

  if (isPending) {
    return (
      <ItemGroup className="gap-4">
        {Array.from({ length: 2 }).map((_, index) => (
          <ScheduleItemSkeleton key={index} />
        ))}
      </ItemGroup>
    )
  }

  if (isError) {
    return (
      <Empty className="p-4 md:p-4">
        <EmptyHeader>
          <EmptyMedia variant="icon" className="mb-2">
            <ClockAlertIcon />
          </EmptyMedia>
          <EmptyTitle>Une erreur est survenue</EmptyTitle>
          <EmptyDescription>
            Essayez d'actualiser en utilisant le bouton ci-dessous.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCcwIcon />
            Actualiser
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  return data.length > 0 ? (
    <ItemGroup className="gap-4">
      {data.map((schedule) => (
        <ScheduleItem key={schedule.id} schedule={schedule} role="listitem" />
      ))}
    </ItemGroup>
  ) : (
    <Empty className="p-4 md:p-4">
      <EmptyHeader>
        <EmptyMedia variant="icon" className="mb-2">
          <ClockAlertIcon />
        </EmptyMedia>
        <EmptyTitle>Rien pour le moment</EmptyTitle>
        <EmptyDescription>
          Utilisez le formulaire ci-dessous pour ajouter des horaires.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
