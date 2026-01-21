// Exportaciones del modulo de reglas de negocio
export type { Regla, ContextoEvaluacion, AccionRecomendada } from './reglas-rendimiento';

export {
  REGLA_BAJO_RENDIMIENTO_TIPO,
  REGLA_EJERCICIO_RECURRENTE_FALLA,
  REGLA_ZSCORE_CRITICO,
  REGLA_TENDENCIA_NEGATIVA,
  REGLA_MEJORA_DETECTADA,
  TODAS_LAS_REGLAS,
  evaluarReglas,
  obtenerPrioridadMaxima,
} from './reglas-rendimiento';
