// Tipos basados EXACTAMENTE en las respuestas del backend
// Verificado contra:
// - backend/src/modules/testing/services/tests-fisicos.service.ts (líneas 680-759)
// - backend/src/modules/registro-post-entrenamiento/registro-post-entrenamiento.service.ts (líneas 355-404)

// ===== TestFisico Response =====

export interface TestFisicoAtleta {
  id: string;
  nombreCompleto: string;
}

export interface TestFisicoEntrenador {
  id: string;
  nombreCompleto: string;
}

export interface TestFisicoSesion {
  id: string;
  fecha: Date;
  numeroSesion: number;
}

export interface TestFisicoMicrociclo {
  id: string;
  numeroGlobalMicrociclo: number;
}

export interface TestFisico {
  id: string;
  atletaId: string;
  entrenadorRegistroId: string;
  sesionId: string | null;
  microcicloId: string | null;
  fechaTest: Date;

  // Tests de fuerza máxima (1RM) - vienen como string desde backend
  pressBanca: string | null;
  pressBancaIntensidad: string | null;
  tiron: string | null;
  tironIntensidad: string | null;
  sentadilla: string | null;
  sentadillaIntensidad: string | null;

  // Tests de fuerza resistencia - vienen como number
  barraFija: number | null;
  paralelas: number | null;

  // Tests de resistencia aeróbica - vienen como string desde backend
  navettePalier: string | null;
  navetteVO2max: string | null;
  clasificacionVO2max: string | null; // Calculado en backend: "Excelente", "Bueno", etc.
  objetivoVO2max: number; // 60 por defecto
  test1500m: string | null;
  test1500mVO2max: string | null;

  // Observaciones
  observaciones: string | null;
  condicionesTest: string | null;

  createdAt: Date;
  updatedAt: Date;

  // Relaciones opcionales
  atleta?: TestFisicoAtleta;
  entrenador?: TestFisicoEntrenador;
  sesion?: TestFisicoSesion;
  microciclo?: TestFisicoMicrociclo;
}

// ===== RegistroPostEntrenamiento Response =====

export interface RegistroPostEntrenamientoAtleta {
  id: string;
  nombreCompleto: string;
}

export interface RegistroPostEntrenamientoMicrociclo {
  numeroGlobalMicrociclo: number;
}

export interface RegistroPostEntrenamientoSesion {
  id: string;
  fecha: Date;
  numeroSesion: number;
  tipoSesion: string;
  microciclo?: RegistroPostEntrenamientoMicrociclo;
}

export interface RegistroPostEntrenamientoEntrenador {
  id: string;
  nombreCompleto: string;
}

export interface Dolencia {
  id: string;
  zona: string;
  nivel: number;
}

export interface RegistroPostEntrenamiento {
  id: string;
  atletaId: string;
  sesionId: string;
  entrenadorRegistroId: string;
  fechaRegistro: Date;

  // Asistencia
  asistio: boolean;
  motivoInasistencia: string | null;

  // Ejecución de la sesión - Decimal vienen como objetos desde backend
  ejerciciosCompletados: any; // Decimal object
  intensidadAlcanzada: any; // Decimal object
  duracionReal: number;

  // RPE (Rate of Perceived Exertion) - 1-10
  rpe: number;

  // Recuperación
  calidadSueno: number; // 1-10
  horasSueno: any; // Decimal object

  // Estado anímico - 1-10
  estadoAnimico: number;

  // Observaciones
  observaciones: string | null;

  createdAt: Date;
  updatedAt: Date;

  // Relaciones opcionales
  atleta?: RegistroPostEntrenamientoAtleta;
  sesion?: RegistroPostEntrenamientoSesion;
  entrenador?: RegistroPostEntrenamientoEntrenador;
  dolencias?: Dolencia[];
}

// ===== Respuesta paginada del backend =====

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ===== Tipos para gráficos (datos transformados) =====

// Datos transformados para gráfico de VO2max
export interface VO2maxDataPoint {
  timestamp: number; // Unix timestamp para eje X continuo
  fecha: string; // Fecha formateada para tooltip
  vo2max: number; // Valor numérico parseado
  clasificacion: string | null; // "Excelente", "Bueno", etc.
  palier: number; // Palier alcanzado
}

// Datos transformados para gráfico de RPE semanal
export interface RPEWeeklyDataPoint {
  semana: string; // "Semana 1", "Semana 2", etc. o rango de fechas
  rpePromedio: number; // Promedio de RPE de la semana
  sesiones: number; // Cantidad de sesiones en la semana
  fechaInicio: Date; // Fecha inicio de la semana
  fechaFin: Date; // Fecha fin de la semana
}

// Datos transformados para gráfico de comparación de tests
export interface TestsComparisonDataPoint {
  nombre: string; // "Press Banca", "Sentadilla", etc.
  actual: number; // Valor del último test
  mejor: number; // Mejor marca personal histórica
  unidad: string; // "kg", "repeticiones", "ml/kg/min"
}

// Datos transformados para gráfico de sueño
export interface SleepDataPoint {
  fecha: string; // Fecha formateada
  timestamp: number; // Unix timestamp
  calidadSueno: number; // 1-10
  horasSueno: number; // Horas con decimal parseado
}

// Datos transformados para gráfico de estado anímico
export interface EstadoAnimicoDataPoint {
  fecha: string;
  timestamp: number;
  estadoAnimico: number; // 1-10
}

// ===== KPIs para el dashboard de progreso =====

export interface ProgresoStats {
  vo2maxActual: number | null;
  vo2maxClasificacion: string | null;
  rpePromedio: number | null;
  testsRealizados: number;
  calidadSuenoPromedio: number | null;
  horasSuenoPromedio: number | null;
}
