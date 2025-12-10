import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

import { client } from '@/lib/client'

export function useAuthQuery() {
  const queryClient = useQueryClient()

  const query = useQuery(authQueryOptions())

  useEffect(() => {
    if (query.error) {
      queryClient.resetQueries({ queryKey: authQueryOptions().queryKey })
    }
  }, [query.error, queryClient])

  return query
}

export function authQueryOptions() {
  return queryOptions({
    queryKey: ['auth'],
    queryFn: async () => {
      const { data, error } = await client.auth.me.$get()
      if (error) {
        throw error
      }
      return data
    },
    retry: 1,
    staleTime: Infinity,
  })
}
