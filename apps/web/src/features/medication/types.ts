import type { client } from '@/lib/client'
import type { InferResponseType } from '@repo/rpc/types'

export type Medication = InferResponseType<typeof client.medications.$get>[number]
