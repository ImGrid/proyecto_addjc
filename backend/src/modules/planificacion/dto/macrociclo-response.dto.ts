import { EstadoMacrociclo } from '@prisma/client';

// DTO de respuesta para Macrociclo
// Estructura que se envía al cliente
export interface MacrocicloResponseDto {
  id: string; // BigInt convertido a string para JSON
  nombre: string;
  temporada: string;
  equipo: string;
  categoriaObjetivo: string;
  objetivo1: string;
  objetivo2: string;
  objetivo3: string;
  fechaInicio: Date;
  fechaFin: Date;
  estado: EstadoMacrociclo;
  totalMicrociclos: number;
  totalSesiones: number;
  totalHoras: number; // Decimal convertido a number
  creadoPor: string; // BigInt convertido a string
  createdAt: Date;
  updatedAt: Date;

  // Relaciones opcionales (si se incluyen)
  creador?: {
    id: string;
    nombreCompleto: string;
    email: string;
  };
}
