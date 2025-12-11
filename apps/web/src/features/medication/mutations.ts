import { useMutation, useQueryClient } from '@tanstack/react-query'

import { toastManager } from '@/components/ui/toast'
import { client } from '@/lib/client'
import type { MedicationEditFormSchema } from './components/medication_edit_form'
import type { MedicationFormSchema } from './components/medication_form'
import { listMedicationQueryOptions, showMedicationQueryOptions } from './queries'

export function useCreateMedicationMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: MedicationFormSchema) => {
      const { data, error } = await client.medications.$post({
        ...values,
        dosage: values.dosage.length ? values.dosage : null,
        form: values.form.length ? values.form : null,
        instructions: values.instructions.length ? values.instructions : null,
      })

      if (error) {
        throw error
      }

      return data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: listMedicationQueryOptions().queryKey })

      toastManager.add({ type: 'success', description: 'Medicament ajouté !' })
    },
  })
}

export function useToggleArchiveMedicationMutation(currentlyActive: boolean) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await client.medications({ medicationId: id }).archive.$post()

      if (error) {
        throw error
      }

      return true
    },
    onSuccess: async (_, id) => {
      await queryClient.invalidateQueries({ queryKey: listMedicationQueryOptions().queryKey })
      await queryClient.invalidateQueries({ queryKey: showMedicationQueryOptions(id).queryKey })

      toastManager.add({
        type: 'success',
        description: currentlyActive ? 'Medicament archivé !' : 'Medicament restauré !',
      })
    },
  })
}

export function useUpdateMedicationMutation(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: MedicationEditFormSchema) => {
      const { data, error } = await client.medications({ medicationId: id }).$put({
        ...values,
        dosage: values.dosage.length ? values.dosage : null,
        form: values.form.length ? values.form : null,
        instructions: values.instructions.length ? values.instructions : null,
      })

      if (error) {
        throw error
      }

      return data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: listMedicationQueryOptions().queryKey })
      await queryClient.invalidateQueries({ queryKey: showMedicationQueryOptions(id).queryKey })

      toastManager.add({ type: 'success', description: 'Medicament modifié !' })
    },
  })
}
