import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

type State = {
  token: string | null
}

type Actions = {
  init: (value: string) => void
  reset: () => void
}

const storageKey = 'auth'

const initialState: State = {
  token: null,
}

export const useAuthTokenStore = create(
  persist<State & Actions>(
    (set) => ({
      ...initialState,
      init: (token) => set({ token }),
      reset: () => set(initialState),
    }),
    {
      name: storageKey,
      storage: createJSONStorage(() => localStorage),
    }
  )
)
