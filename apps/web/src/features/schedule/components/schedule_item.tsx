import { TrashIcon } from 'lucide-react'

import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert_dialog'
import { Button } from '@/components/ui/button'
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item'
import { Switch } from '@/components/ui/switch'
import { daysOptions } from '../contents/days'
import { useDeleteScheduleMutation, useToggleActiveScheduleMutation } from '../mutations'
import type { Schedule } from '../types'
import { Skeleton } from '@/components/ui/skeleton'

interface ScheduleItemProps extends React.ComponentProps<typeof Item> {
  schedule: Schedule
}

export function ScheduleItem({ schedule, variant = 'outline', ...props }: ScheduleItemProps) {
  const { mutate: toggleActive } = useToggleActiveScheduleMutation()
  const { mutate: deleteSchedule } = useDeleteScheduleMutation()

  return (
    <Item variant={variant} {...props}>
      <ItemContent>
        <ItemTitle className="line-clamp-1">
          <span className="font-bold">{schedule.timeOfDay.slice(0, -3)}</span> •{' '}
          <span className="text-muted-foreground">
            {schedule.daysOfWeek
              ? new Intl.ListFormat().format(
                  schedule.daysOfWeek.map(
                    (day) => daysOptions.find((d) => Number(d.value) === day)!.label
                  )
                )
              : 'Tous les jours'}
          </span>
        </ItemTitle>
        <ItemDescription>Notes: {schedule.notes ? schedule.notes : 'Pas de notes'}</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Switch
          checked={schedule.active}
          onCheckedChange={() =>
            toggleActive({ medicationId: schedule.medicationId, scheduleId: schedule.id })
          }
        />
        <AlertDialog>
          <AlertDialogTrigger render={<Button variant="secondary" size="icon" />}>
            <TrashIcon />
          </AlertDialogTrigger>
          <AlertDialogPopup>
            <AlertDialogHeader>
              <AlertDialogTitle>Etês-vous absolument sûr ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cet action ne peut pas être annulé. Cela supprimera définitivement cet horaire.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogClose render={<Button variant="ghost" />}>Annuler</AlertDialogClose>
              <AlertDialogClose
                onClick={() =>
                  deleteSchedule({ medicationId: schedule.medicationId, scheduleId: schedule.id })
                }
                render={<Button variant="destructive" />}
              >
                Supprimer
              </AlertDialogClose>
            </AlertDialogFooter>
          </AlertDialogPopup>
        </AlertDialog>
      </ItemActions>
    </Item>
  )
}

export function ScheduleItemSkeleton() {
  return (
    <Item variant="outline">
      <ItemContent>
        <div className="flex flex-row gap-2 w-full">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-4 max-w-48" />
      </ItemContent>
      <ItemActions>
        <Skeleton className="size-8" />
        <Skeleton className="size-8" />
      </ItemActions>
    </Item>
  )
}
