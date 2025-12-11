import { queryOptions } from '@tanstack/react-query'

import { client } from '@/lib/client'

export function listMedicationScheculeQueryOptions(medicationId: number) {
  return queryOptions({
    queryKey: ['medications.schedules', medicationId],
    queryFn: async () => {
      const { data, error } = await client.medications({ medicationId }).schedules.$get()

      if (error) {
        throw error
      }

      return data
    },
  })
}
