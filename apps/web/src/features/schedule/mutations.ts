import { useMutation, useQueryClient } from '@tanstack/react-query'

import { toastManager } from '@/components/ui/toast'
import { client } from '@/lib/client'
import type { MedicationScheduleFormSchema } from './components/medication_schedule_form'
import { listMedicationScheculeQueryOptions } from './queries'

export function useAddMedicationScheduleMutation(medicationId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: MedicationScheduleFormSchema) => {
      const { data, error } = await client.medications({ medicationId }).schedules.$post({
        ...values,
        daysOfWeek: values.daysOfWeek.length > 0 ? values.daysOfWeek : null,
        notes: values.notes.length > 0 ? values.notes : null,
      })

      if (error) {
        throw error
      }

      return data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: listMedicationScheculeQueryOptions(medicationId).queryKey,
      })
      toastManager.add({ type: 'success', description: 'Horaire ajouté !' })
    },
  })
}

export function useToggleActiveScheduleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (options: { medicationId: number; scheduleId: number }) => {
      const { medicationId, scheduleId } = options

      const { error } = await client
        .medications({ medicationId })
        .schedules({ scheduleId })
        .archive.$post()

      if (error) {
        throw error
      }

      return true
    },
    onMutate: async (variables) => {
      const schedulesQueryKey = listMedicationScheculeQueryOptions(variables.medicationId).queryKey

      await queryClient.cancelQueries({
        queryKey: schedulesQueryKey,
      })

      const previousSchedules = queryClient.getQueryData(schedulesQueryKey)

      queryClient.setQueryData(schedulesQueryKey, (old: any) => {
        if (!old) return old
        let newValues = old.map((schedule: any) =>
          schedule.id === variables.scheduleId
            ? { ...schedule, active: !schedule.active }
            : schedule
        )

        return newValues
      })

      return { previousSchedules }
    },
    onError: (_error, variables, context) => {
      queryClient.setQueryData(
        listMedicationScheculeQueryOptions(variables.medicationId).queryKey,
        context?.previousSchedules
      )
      toastManager.add({
        type: 'error',
        description: "Impossible de modifier l'état de l'horaire.",
      })
    },
    onSettled: async (_data, _error, { medicationId }) => {
      await queryClient.invalidateQueries({
        queryKey: listMedicationScheculeQueryOptions(medicationId).queryKey,
      })
    },
  })
}

export function useDeleteScheduleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (options: { medicationId: number; scheduleId: number }) => {
      const { medicationId, scheduleId } = options

      const { error } = await client
        .medications({ medicationId })
        .schedules({ scheduleId })
        .$delete()

      if (error) {
        throw error
      }

      return true
    },
    onMutate: async (variables) => {
      const schedulesQueryKey = listMedicationScheculeQueryOptions(variables.medicationId).queryKey

      await queryClient.cancelQueries({
        queryKey: schedulesQueryKey,
      })

      const previousSchedules = queryClient.getQueryData(schedulesQueryKey)

      queryClient.setQueryData(schedulesQueryKey, (old: any) => {
        if (!old) return old
        let newValues = old.filter((schedule: any) => schedule.id !== variables.scheduleId)

        return newValues
      })

      return { previousSchedules }
    },
    onError: (_error, variables, context) => {
      queryClient.setQueryData(
        listMedicationScheculeQueryOptions(variables.medicationId).queryKey,
        context?.previousSchedules
      )
      toastManager.add({
        type: 'error',
        description: "Impossible de supprimer l'horaire.",
      })
    },
    onSettled: async (_data, _error, { medicationId }) => {
      await queryClient.invalidateQueries({
        queryKey: listMedicationScheculeQueryOptions(medicationId).queryKey,
      })
    },
  })
}
