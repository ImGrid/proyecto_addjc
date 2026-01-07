import {
  DiaSemana,
  TipoSesion,
  Turno,
  TipoPlanificacion,
  CreadoPor,
} from '@prisma/client';

export interface SesionResponseDto {
  id: string; // BigInt → string
  microcicloId: string; // BigInt → string
  fecha: Date;
  diaSemana: DiaSemana;
  numeroSesion: number;
  tipoSesion: TipoSesion;
  turno: Turno;
  tipoPlanificacion: TipoPlanificacion;
  sesionBaseId: string | null; // BigInt → string
  creadoPor: CreadoPor;
  duracionPlanificada: number;
  volumenPlanificado: number;
  intensidadPlanificada: number;
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
  microciclo?: {
    id: string;
    numeroGlobalMicrociclo: number;
    fechaInicio: Date;
    fechaFin: Date;
  };
}
