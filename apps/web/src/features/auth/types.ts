import type { InferResponseType } from '@repo/rpc/types'
import type { client } from '@/lib/client'

export type User = InferResponseType<typeof client.auth.me.$get>
