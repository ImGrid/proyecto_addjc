// Tipos TypeScript basados EXACTAMENTE en lo que retorna el backend
// Fuente: backend/src/modules/planificacion/services/microciclos.service.ts:426-470
// Fuente: backend/src/modules/planificacion/services/sesiones.service.ts:334-374

// Tipo para la sesion resumida (dentro de microciclo)
export interface SesionResumida {
  id: string;
  fecha: Date;
  diaSemana: string;
  tipoSesion: string;
}

// Tipo para el mesociclo (dentro de microciclo)
export interface MesocicloResumido {
  id: string;
  nombre: string;
  etapa: string;
}

// Tipo para el microciclo completo (GET /api/microciclos)
export interface Microciclo {
  id: string;
  mesocicloId: string | null;
  numeroMicrociclo: number;
  numeroGlobalMicrociclo: number;
  fechaInicio: Date;
  fechaFin: Date;
  tipoMicrociclo: string;
  volumenTotal: number;
  intensidadPromedio: number;
  objetivoSemanal: string;
  observaciones: string | null;
  creadoPor: string;
  mediaVolumen: number | null;
  mediaIntensidad: number | null;
  sentidoVolumen: string | null;
  sentidoIntensidad: string | null;
  vCarga1: number | null;
  vCarga1Nivel: number | null;
  iCarga1: number | null;
  iCarga1Nivel: number | null;
  vCarga2: number | null;
  vCarga2Nivel: number | null;
  iCarga2: number | null;
  iCarga2Nivel: number | null;
  createdAt: Date;
  updatedAt: Date;
  mesociclo?: MesocicloResumido;
  sesiones?: SesionResumida[];
}

// Tipo para el microciclo resumido (dentro de sesion)
export interface MicrocicloResumido {
  id: string;
  numeroGlobalMicrociclo: number;
  fechaInicio: Date;
  fechaFin: Date;
}

// Tipo para la sesion completa (GET /api/sesiones/:id)
export interface Sesion {
  id: string;
  microcicloId: string;
  fecha: Date;
  diaSemana: string;
  numeroSesion: number;
  tipoSesion: string;
  turno: string;
  tipoPlanificacion: string;
  sesionBaseId: string | null;
  creadoPor: string;
  duracionPlanificada: number;
  volumenPlanificado: number;
  intensidadPlanificada: number;
  fcObjetivo: number | null;
  relacionVI: string;
  zonaEsfuerzo: string | null;
  duracionReal: number | null;
  volumenReal: number | null;
  intensidadReal: number | null;
  contenidoFisico: string;
  contenidoTecnico: string;
  contenidoTactico: string;
  calentamiento: string | null;
  partePrincipal: string | null;
  vueltaCalma: string | null;
  observaciones: string | null;
  materialNecesario: string | null;
  createdAt: Date;
  updatedAt: Date;
  microciclo?: MicrocicloResumido;
}
