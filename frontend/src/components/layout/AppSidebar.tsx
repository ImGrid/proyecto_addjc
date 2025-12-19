'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { KimonoIcon } from '@/components/ui/kimono-icon';
import { navigationConfig } from '@/lib/navigation';
import type { Usuario } from '@/types/auth';

interface AppSidebarProps {
  user: Usuario;
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();
  const navigation = navigationConfig[user.rol];

  return (
    <Sidebar className="w-[260px]">
      <SidebarHeader className="border-b p-6">
        <div className="flex items-center gap-3">
          <KimonoIcon size={32} className="inline-block" />
          <span className="text-[1.5rem] font-bold text-secondary tracking-tight">
            ADDJC
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1 px-3">
              {navigation.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`
                        flex items-center gap-3 px-6 py-[0.875rem] my-1 rounded-lg font-medium transition-all duration-300
                        ${
                          isActive
                            ? 'bg-gradient-to-br from-primary to-primary-dark text-white shadow-md hover:shadow-lg'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }
                      `}
                    >
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 w-full"
                      >
                        <item.icon
                          className="h-5 w-5 flex-shrink-0"
                          strokeWidth={2}
                        />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <Link
          href="/api/auth/logout"
          className="flex items-center gap-3 px-4 py-[0.875rem] text-danger font-medium rounded-lg transition-all duration-300 hover:bg-danger/10"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" strokeWidth={2} />
          <span>Cerrar sesión</span>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
