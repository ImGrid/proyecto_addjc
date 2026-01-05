// Archivo centralizado de rutas de la aplicacion
// Este archivo evita hardcodear rutas en formularios y componentes
// Cualquier cambio en la estructura de rutas debe reflejarse aqui

// Rutas del Comite Tecnico
export const COMITE_TECNICO_ROUTES = {
  // Dashboard
  dashboard: '/comite-tecnico',

  // Atletas
  atletas: {
    list: '/comite-tecnico/atletas',
    nuevo: '/comite-tecnico/atletas/nuevo',
    editar: (id: string | number) => `/comite-tecnico/atletas/${id}/editar`,
  },

  // Asignaciones (atleta-microciclo)
  asignaciones: {
    list: '/comite-tecnico/asignaciones',
    nueva: '/comite-tecnico/asignaciones/nueva',
  },

  // Planificacion
  planificacion: {
    // Macrociclos
    macrociclos: {
      list: '/comite-tecnico/planificacion',
      nuevo: '/comite-tecnico/planificacion/nuevo',
      editar: (id: string | number) => `/comite-tecnico/planificacion/${id}/editar`,
    },
    // Mesociclos
    mesociclos: {
      list: '/comite-tecnico/planificacion/mesociclos',
      nuevo: '/comite-tecnico/planificacion/mesociclos/nuevo',
      editar: (id: string | number) => `/comite-tecnico/planificacion/mesociclos/${id}/editar`,
    },
    // Microciclos
    microciclos: {
      list: '/comite-tecnico/planificacion/microciclos',
      nuevo: '/comite-tecnico/planificacion/microciclos/nuevo',
      editar: (id: string | number) => `/comite-tecnico/planificacion/microciclos/${id}/editar`,
    },
  },

  // Sesiones
  sesiones: {
    list: '/comite-tecnico/sesiones',
    nuevo: '/comite-tecnico/sesiones/nuevo',
    detalle: (id: string | number) => `/comite-tecnico/sesiones/${id}`,
    editar: (id: string | number) => `/comite-tecnico/sesiones/${id}/editar`,
  },
} as const;

// Rutas del Entrenador
export const ENTRENADOR_ROUTES = {
  // Dashboard
  dashboard: '/entrenador',

  // Mis Atletas
  misAtletas: {
    list: '/entrenador/mis-atletas',
    detalle: (atletaId: string | number) => `/entrenador/mis-atletas/${atletaId}`,
  },

  // Sesiones
  sesiones: {
    list: '/entrenador/sesiones',
    nuevo: '/entrenador/sesiones/nuevo',
    detalle: (id: string | number) => `/entrenador/sesiones/${id}`,
    editar: (id: string | number) => `/entrenador/sesiones/${id}/editar`,
  },

  // Tests Fisicos
  testsFisicos: {
    list: '/entrenador/tests-fisicos',
    nuevo: '/entrenador/tests-fisicos/nuevo',
  },

  // Post-Entrenamiento (registros)
  postEntrenamiento: {
    list: '/entrenador/post-entrenamiento',
    nuevo: '/entrenador/post-entrenamiento/nuevo',
  },

  // Dolencias
  dolencias: '/entrenador/dolencias',
} as const;

// Rutas del Atleta
export const ATLETA_ROUTES = {
  // Dashboard
  dashboard: '/atleta',

  // Planificacion (solo lectura)
  planificacion: '/atleta/planificacion',

  // Progreso
  progreso: '/atleta/progreso',

  // Tests (solo lectura)
  tests: '/atleta/tests',

  // Dolencias
  dolencias: '/atleta/dolencias',
} as const;

// Rutas del Administrador
export const ADMIN_ROUTES = {
  // Dashboard
  dashboard: '/admin',

  // Usuarios
  usuarios: {
    list: '/admin/usuarios',
  },
} as const;

// Rutas de autenticacion (publicas)
export const AUTH_ROUTES = {
  login: '/login',
} as const;
