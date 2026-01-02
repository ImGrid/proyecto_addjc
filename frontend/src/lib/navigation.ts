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
  Heart,
  AlertTriangle,
  UserCog,
  Link,
  Layers,
  CalendarDays,
  CalendarRange,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { RolUsuario } from '@/types/auth';

export interface NavigationSubItem {
  href: string;
  label: string;
}

export interface NavigationItem {
  href: string;
  label: string;
  icon: LucideIcon;
  children?: NavigationSubItem[];
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
      href: '/comite-tecnico/atletas',
      label: 'Atletas',
      icon: Trophy,
    },
    {
      href: '/comite-tecnico/entrenadores',
      label: 'Entrenadores',
      icon: UserCog,
    },
    {
      href: '/comite-tecnico/planificacion',
      label: 'Planificacion',
      icon: Calendar,
      children: [
        {
          href: '/comite-tecnico/planificacion',
          label: 'Macrociclos',
        },
        {
          href: '/comite-tecnico/planificacion/mesociclos',
          label: 'Mesociclos',
        },
        {
          href: '/comite-tecnico/planificacion/microciclos',
          label: 'Microciclos',
        },
      ],
    },
    {
      href: '/comite-tecnico/asignaciones',
      label: 'Asignaciones',
      icon: Link,
    },
    {
      href: '/comite-tecnico/tests-fisicos',
      label: 'Tests Fisicos',
      icon: Clipboard,
    },
    {
      href: '/comite-tecnico/estadisticas',
      label: 'Estadisticas',
      icon: BarChart,
    },
    {
      href: '/comite-tecnico/post-entrenamiento',
      label: 'Post-Entrenamiento',
      icon: Activity,
    },
    {
      href: '/comite-tecnico/dolencias',
      label: 'Dolencias',
      icon: AlertTriangle,
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
    {
      href: '/entrenador/dolencias',
      label: 'Dolencias',
      icon: AlertTriangle,
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
    {
      href: '/atleta/dolencias',
      label: 'Mis Dolencias',
      icon: Heart,
    },
    // Pendiente de implementar (Fase 6)
    // {
    //   href: '/atleta/recomendaciones',
    //   label: 'Recomendaciones',
    //   icon: Bell,
    // },
  ],
};
