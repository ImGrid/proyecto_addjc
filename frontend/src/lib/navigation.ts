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
  CalendarClock,
  Medal,
  Lightbulb,
  LineChart,
  ShieldAlert,
  BookOpen,
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
      href: '/admin/actividad',
      label: 'Actividad',
      icon: Activity,
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
      href: '/comite-tecnico/sesiones',
      label: 'Sesiones',
      icon: CalendarClock,
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
      href: '/comite-tecnico/ranking',
      label: 'Ranking',
      icon: Medal,
    },
    {
      href: '/comite-tecnico/recomendaciones',
      label: 'Recomendaciones',
      icon: Lightbulb,
    },
    {
      href: '/comite-tecnico/analisis',
      label: 'Analisis',
      icon: LineChart,
    },
    {
      href: '/comite-tecnico/alertas',
      label: 'Alertas',
      icon: ShieldAlert,
    },
    {
      href: '/comite-tecnico/notificaciones',
      label: 'Notificaciones',
      icon: Bell,
    },
    {
      href: '/comite-tecnico/catalogo-ejercicios',
      label: 'Catalogo Ejercicios',
      icon: BookOpen,
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
      href: '/entrenador/planificacion',
      label: 'Planificacion',
      icon: Calendar,
      children: [
        {
          href: '/entrenador/planificacion',
          label: 'Macrociclos',
        },
        {
          href: '/entrenador/planificacion/mesociclos',
          label: 'Mesociclos',
        },
        {
          href: '/entrenador/planificacion/microciclos',
          label: 'Microciclos',
        },
      ],
    },
    {
      href: '/entrenador/sesiones',
      label: 'Sesiones',
      icon: CalendarClock,
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
    {
      href: '/entrenador/ranking',
      label: 'Ranking',
      icon: Medal,
    },
    {
      href: '/entrenador/recomendaciones',
      label: 'Recomendaciones',
      icon: Lightbulb,
    },
    {
      href: '/entrenador/alertas',
      label: 'Alertas',
      icon: ShieldAlert,
    },
    {
      href: '/entrenador/notificaciones',
      label: 'Notificaciones',
      icon: Bell,
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
    {
      href: '/atleta/ranking',
      label: 'Mi Ranking',
      icon: Medal,
    },
    {
      href: '/atleta/analisis',
      label: 'Mi Analisis',
      icon: LineChart,
    },
    {
      href: '/atleta/notificaciones',
      label: 'Notificaciones',
      icon: Bell,
    },
  ],
};
