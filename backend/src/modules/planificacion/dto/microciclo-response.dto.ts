import { TipoMicrociclo, CreadoPor, SentidoCarga } from '@prisma/client';

export interface MicrocicloResponseDto {
  id: string; // BigInt → string
  mesocicloId: string | null; // BigInt → string
  numeroMicrociclo: number | null;
  numeroGlobalMicrociclo: number;
  fechaInicio: Date;
  fechaFin: Date;
  tipoMicrociclo: TipoMicrociclo;
  volumenTotal: number; // Decimal → number
  intensidadPromedio: number; // Decimal → number
  objetivoSemanal: string;
  observaciones: string | null;
  creadoPor: CreadoPor;
  mediaVolumen: number | null; // Decimal → number
  mediaIntensidad: number | null; // Decimal → number
  sentidoVolumen: SentidoCarga | null;
  sentidoIntensidad: SentidoCarga | null;
  vCarga1: number | null; // Decimal → number
  vCarga1Nivel: number | null;
  iCarga1: number | null; // Decimal → number
  iCarga1Nivel: number | null;
  vCarga2: number | null; // Decimal → number
  vCarga2Nivel: number | null;
  iCarga2: number | null; // Decimal → number
  iCarga2Nivel: number | null;
  createdAt: Date;
  updatedAt: Date;
  mesociclo?: {
    id: string;
    nombre: string;
    etapa: string;
  };
  sesiones?: Array<{
    id: string;
    fecha: Date;
    diaSemana: string;
    tipoSesion: string;
  }>;
}
