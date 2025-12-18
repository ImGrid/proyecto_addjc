import { EtapaMesociclo } from '@prisma/client';

export interface MesocicloResponseDto {
  id: string; // BigInt → string
  macrocicloId: string; // BigInt → string
  nombre: string;
  numeroMesociclo: number;
  etapa: EtapaMesociclo;
  fechaInicio: Date;
  fechaFin: Date;
  objetivoFisico: string;
  objetivoTecnico: string;
  objetivoTactico: string;
  totalMicrociclos: number;
  createdAt: Date;
  updatedAt: Date;
  macrociclo?: {
    id: string;
    nombre: string;
    temporada: string;
  };
}
