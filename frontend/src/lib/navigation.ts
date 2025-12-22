import {
  Home,
  Users,
  Settings,
  Calendar,
  Trophy,
  Clipboard,
  Activity,
  BarChart,
  Bell,
  Database,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { RolUsuario } from '@/types/auth';

export interface NavigationItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const navigationConfig: Record<RolUsuario, NavigationItem[]> = {
  ADMINISTRADOR: [
    {
      href: '/admin',
      label: 'Dashboard',
      icon: Home,
    },
    {
      href: '/admin/usuarios',
      label: 'Usuarios',
      icon: Users,
    },
    {
      href: '/admin/configuracion',
      label: 'Configuracion',
      icon: Settings,
    },
    {
      href: '/admin/auditoria',
      label: 'Auditoria',
      icon: Database,
    },
  ],

  COMITE_TECNICO: [
    {
      href: '/comite-tecnico',
      label: 'Dashboard',
      icon: Home,
    },
    {
      href: '/comite-tecnico/planificacion',
      label: 'Planificacion',
      icon: Calendar,
    },
    {
      href: '/comite-tecnico/atletas',
      label: 'Atletas',
      icon: Trophy,
    },
    {
      href: '/comite-tecnico/recomendaciones',
      label: 'Recomendaciones',
      icon: Bell,
    },
  ],

  ENTRENADOR: [
    {
      href: '/entrenador',
      label: 'Dashboard',
      icon: Home,
    },
    {
      href: '/entrenador/mis-atletas',
      label: 'Mis Atletas',
      icon: Trophy,
    },
    {
      href: '/entrenador/tests-fisicos',
      label: 'Tests Fisicos',
      icon: Clipboard,
    },
    {
      href: '/entrenador/post-entrenamiento',
      label: 'Post-Entrenamiento',
      icon: Activity,
    },
  ],

  ATLETA: [
    {
      href: '/atleta',
      label: 'Dashboard',
      icon: Home,
    },
    {
      href: '/atleta/tests',
      label: 'Tests Fisicos',
      icon: Activity,
    },
    {
      href: '/atleta/planificacion',
      label: 'Mi Plan',
      icon: Calendar,
    },
    {
      href: '/atleta/progreso',
      label: 'Mi Progreso',
      icon: BarChart,
    },
    // Pendiente de implementar (Fase 6)
    // {
    //   href: '/atleta/recomendaciones',
    //   label: 'Recomendaciones',
    //   icon: Bell,
    // },
  ],
};
