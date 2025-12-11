import { queryOptions } from '@tanstack/react-query'

import { client } from '@/lib/client'

export function listMedicationQueryOptions() {
  return queryOptions({
    queryKey: ['medications'],
    queryFn: async () => {
      const { data, error } = await client.medications.$get()

      if (error) {
        throw error
      }

      return data
    },
  })
}

export function showMedicationQueryOptions(id: number) {
  return queryOptions({
    queryKey: ['medications', id],
    queryFn: async () => {
      const { data, error } = await client.medications({ medicationId: id }).$get()

      if (error) {
        throw error
      }

      return data
    },
  })
}
