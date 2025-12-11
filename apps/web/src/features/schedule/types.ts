import type { client } from '@/lib/client'
import type { InferResponseType } from '@repo/rpc/types'

export type Schedule = InferResponseType<
  ReturnType<typeof client.medications>['schedules']['$get']
>[number]
