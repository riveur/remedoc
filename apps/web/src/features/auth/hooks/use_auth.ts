import { useAuthQuery } from '@/features/auth/queries'

export function useAuth() {
  const authQuery = useAuthQuery()

  const user = authQuery.data || null

  return { user }
}
