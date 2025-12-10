import * as React from 'react'

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { AppSidebar } from './app_sidebar'
import { Separator } from '@/components/ui/separator'

export function Layout({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div
          className={cn('flex flex-1 flex-col gap-4 max-w-4xl w-full mx-auto p-4', className)}
          {...props}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}

export function LayoutHeader({ children, className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('flex flex-col gap-4', className)} {...props}>
      <div className="space-y-1.5">{children}</div>
      <Separator className="my-2" />
    </div>
  )
}

export function LayoutTitle({ children, className, ...props }: React.ComponentProps<'h1'>) {
  return (
    <h1 className={cn('text-xl font-bold tracking-tighter', className)} {...props}>
      {children}
    </h1>
  )
}
export function LayoutDescription({ children, className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p className={cn('text-muted-foreground', className)} {...props}>
      {children}
    </p>
  )
}
