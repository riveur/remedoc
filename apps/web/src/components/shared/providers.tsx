import { QueryClientProvider } from '@tanstack/react-query'

import { queryClient } from '@/lib/react_query'
import { AnchoredToastProvider, ToastProvider } from '../ui/toast'
import { ThemeProvider } from './theme_provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AnchoredToastProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider defaultTheme="dark">{children}</ThemeProvider>
        </QueryClientProvider>
      </AnchoredToastProvider>
    </ToastProvider>
  )
}
