import { Link } from '@tanstack/react-router'
import { ChevronsUpDown, LogOutIcon, UserIcon } from 'lucide-react'

import { ThemeIcon } from '@/components/shared/theme_icon'
import { useTheme } from '@/components/shared/theme_provider'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useLogoutMutation } from '@/features/auth/mutations'
import type { User } from '@/features/auth/types'

interface NavUserProps {
  user: User
}

export function NavUser({ user }: NavUserProps) {
  const { isMobile } = useSidebar()
  const { theme, setTheme } = useTheme()

  const changeTheme = () => {
    switch (theme) {
      case 'light':
        setTheme('dark')
        break
      case 'dark':
        setTheme('system')
        break
      case 'system':
        setTheme('light')
        break
    }
  }

  const { mutate: logout, isPending: logoutIsPending } = useLogoutMutation()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="hover:bg-sidebar-accent data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="size-8">
                  <AvatarImage src={user.avatarUrl} alt={user.username} />
                  <AvatarFallback>{user.username.at(0)?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="truncate text-sm leading-tight font-medium">{user.username}</span>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            }
          />
          <DropdownMenuContent
            className="w-(--anchor-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'top'}
            align="center"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="size-8">
                    <AvatarImage src={user.avatarUrl} alt={user.username} />
                    <AvatarFallback>{user.username.at(0)?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="truncate text-sm leading-tight font-medium">
                    {user.username}
                  </span>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                render={
                  <Link preload={false} to="/dashboard">
                    <UserIcon />
                    Paramètres
                  </Link>
                }
              ></DropdownMenuItem>
              <DropdownMenuItem closeOnClick={false} onClick={changeTheme}>
                <ThemeIcon />
                Thème
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={logoutIsPending} onClick={() => logout()}>
              <LogOutIcon />
              Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
