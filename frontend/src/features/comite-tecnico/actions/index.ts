// Re-exports de Server Actions para COMITE_TECNICO

// Base helpers
export { getAuthToken, authFetch } from './base';

// Dashboard
export { fetchDashboardStats } from './fetch-dashboard-stats';

// Atletas
export { fetchAtletas, fetchAtleta } from './fetch-atletas';
export type { FetchAtletasParams } from './fetch-atletas';

// Entrenadores
export { fetchEntrenadores, fetchEntrenador } from './fetch-entrenadores';
export type { FetchEntrenadoresParams } from './fetch-entrenadores';

// Planificacion (Macrociclos, Mesociclos, Microciclos, Asignaciones)
export {
  fetchMacrociclos,
  fetchMacrociclo,
  fetchMesociclos,
  fetchMesociclo,
  fetchMicrociclos,
  fetchMicrociclo,
  fetchAsignaciones,
  fetchAsignacion,
} from './fetch-planificacion';
export type {
  FetchMacrociclosParams,
  FetchMesociclosParams,
  FetchMicrociclosParams,
  FetchAsignacionesParams,
} from './fetch-planificacion';

// Tests Fisicos y Dolencias
export {
  fetchTestsFisicos,
  fetchTestFisico,
  fetchTestsByAtleta,
  fetchDolencias,
  fetchDolencia,
  fetchDolenciasActivasByAtleta,
} from './fetch-tests-dolencias';
export type { FetchTestsFisicosParams, FetchDolenciasParams } from './fetch-tests-dolencias';

// Acciones de escritura - Macrociclos
export { createMacrociclo, updateMacrociclo, deleteMacrociclo } from './macrociclo.actions';

// Acciones de escritura - Mesociclos
export { createMesociclo, updateMesociclo, deleteMesociclo } from './mesociclo.actions';

// Acciones de escritura - Microciclos
export { createMicrociclo, updateMicrociclo, deleteMicrociclo } from './microciclo.actions';

// Acciones de escritura - Asignaciones
export { createAsignacion, deleteAsignacion, toggleAsignacionActiva } from './asignacion.actions';

// Acciones de escritura - Atletas
export { createAtleta, updateAtleta, deleteAtleta } from './atleta.actions';

// Estadisticas de atletas
export {
  fetchAtletaEstadisticas,
  fetchAtletaEvolucion,
  fetchAtletaEstadisticasCompletas,
} from './fetch-estadisticas';
export type { AtletaEstadisticas, AtletaEvolucion, TipoTest } from './fetch-estadisticas';
export { TIPOS_TEST } from './estadisticas.types';

// Registros Post-Entrenamiento
export {
  fetchRegistrosPostEntrenamiento,
  fetchRegistroPostEntrenamiento,
} from './fetch-registros';
export type {
  RegistroPostEntrenamiento,
  FetchRegistrosParams,
  FetchRegistrosResult,
} from './fetch-registros';
