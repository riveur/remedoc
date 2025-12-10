import { Link, useMatches } from '@tanstack/react-router'
import { TelescopeIcon } from 'lucide-react'

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const items = [
  {
    title: "Vue d'ensemble",
    url: '/dashboard',
    icon: TelescopeIcon,
    children: ['/dashboard'],
  },
]

export function NavMain() {
  const matches = useMatches()

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.url}>
            <SidebarMenuButton
              isActive={
                matches.at(-1)!.fullPath.startsWith(item.url) &&
                item.children.includes(matches.at(-1)!.fullPath)
              }
              tooltip={item.title}
              render={
                <Link preload={false} to={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              }
            />
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
