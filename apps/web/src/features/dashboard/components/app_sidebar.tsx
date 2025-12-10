import * as React from 'react'
import { PillIcon } from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { useAuth } from '@/features/auth/hooks/use_auth'
import { NavMain } from '@/features/dashboard/components/nav_main'
import { NavUser } from '@/features/dashboard/components/nav_user'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex flex-row items-center justify-center gap-2 py-2 overflow-hidden">
          <PillIcon className="size-6" />
          <span className="font-bold truncate group-data-[collapsible=icon]:hidden">Remedoc</span>
        </div>
      </SidebarHeader>
      <SidebarSeparator className="mx-0" />
      <SidebarContent>
        <NavMain />
      </SidebarContent>
      <SidebarSeparator className="mx-0" />
      {user && (
        <SidebarFooter>
          <NavUser user={user} />
        </SidebarFooter>
      )}
      <SidebarRail />
    </Sidebar>
  )
}
