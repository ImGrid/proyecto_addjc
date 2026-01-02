import { z } from 'zod';
import {
  EstadoMacrocicloValues,
  EtapaMesocicloValues,
  TipoMicrocicloValues,
  SentidoCargaValues,
  DiaSemanaValues,
  TipoSesionValues,
} from '@/types/enums';

// ===================================
// MACROCICLO
// Basado en: backend/prisma/schema.prisma model Macrociclo
// ===================================

export const macrocicloSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  temporada: z.string(),
  equipo: z.string(),
  categoriaObjetivo: z.string(),
  objetivo1: z.string(),
  objetivo2: z.string(),
  objetivo3: z.string(),
  fechaInicio: z.coerce.date(),
  fechaFin: z.coerce.date(),
  estado: z.enum(EstadoMacrocicloValues as [string, ...string[]]),
  totalMicrociclos: z.number().int(),
  totalSesiones: z.number().int(),
  totalHoras: z.number(),
  creadoPor: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  // Relacion opcional con creador (backend retorna: id, nombreCompleto, email)
  creador: z
    .object({
      id: z.string(),
      nombreCompleto: z.string(),
      email: z.string(),
    })
    .optional(),
});

export type Macrociclo = z.infer<typeof macrocicloSchema>;

// ===================================
// MESOCICLO
// Basado en: backend/prisma/schema.prisma model Mesociclo
// ===================================

export const mesocicloSchema = z.object({
  id: z.string(),
  macrocicloId: z.string(),
  nombre: z.string(),
  numeroMesociclo: z.number().int(),
  etapa: z.enum(EtapaMesocicloValues as [string, ...string[]]),
  fechaInicio: z.coerce.date(),
  fechaFin: z.coerce.date(),
  objetivoFisico: z.string(),
  objetivoTecnico: z.string(),
  objetivoTactico: z.string(),
  totalMicrociclos: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  // Relaciones opcionales
  // Backend retorna: id, nombre, temporada (ver mesociclos.service.ts lineas 62-67)
  macrociclo: z
    .object({
      id: z.string(),
      nombre: z.string(),
      temporada: z.string(),
    })
    .optional(),
});

export type Mesociclo = z.infer<typeof mesocicloSchema>;

// ===================================
// MICROCICLO
// Basado en: backend/src/modules/planificacion/dto/microciclo-response.dto.ts
// y backend/src/modules/planificacion/services/microciclos.service.ts (formatMicrocicloResponse)
// ===================================

export const microcicloSchema = z.object({
  id: z.string(),
  mesocicloId: z.string().nullable(),
  numeroMicrociclo: z.number().int().nullable(),
  numeroGlobalMicrociclo: z.number().int(),
  fechaInicio: z.coerce.date(),
  fechaFin: z.coerce.date(),
  tipoMicrociclo: z.enum(TipoMicrocicloValues as [string, ...string[]]),
  volumenTotal: z.number(),
  intensidadPromedio: z.number(),
  objetivoSemanal: z.string(),
  observaciones: z.string().nullable(),
  creadoPor: z.string(),
  mediaVolumen: z.number().nullable(),
  mediaIntensidad: z.number().nullable(),
  sentidoVolumen: z.enum(SentidoCargaValues as [string, ...string[]]).nullable(),
  sentidoIntensidad: z.enum(SentidoCargaValues as [string, ...string[]]).nullable(),
  // Campos de carga semanal (backend retorna estos campos)
  vCarga1: z.number().nullable(),
  vCarga1Nivel: z.number().int().nullable(),
  iCarga1: z.number().nullable(),
  iCarga1Nivel: z.number().int().nullable(),
  vCarga2: z.number().nullable(),
  vCarga2Nivel: z.number().int().nullable(),
  iCarga2: z.number().nullable(),
  iCarga2Nivel: z.number().int().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  // Relacion opcional con mesociclo (backend retorna: id, nombre, etapa)
  mesociclo: z
    .object({
      id: z.string(),
      nombre: z.string(),
      etapa: z.string(),
    })
    .nullable()
    .optional(),
  // Sesiones (backend retorna array, no count)
  sesiones: z
    .array(
      z.object({
        id: z.string(),
        fecha: z.coerce.date(),
        diaSemana: z.enum(DiaSemanaValues as [string, ...string[]]),
        tipoSesion: z.enum(TipoSesionValues as [string, ...string[]]),
      })
    )
    .optional(),
});

export type MicrocicloType = z.infer<typeof microcicloSchema>;

// ===================================
// ASIGNACION ATLETA-MICROCICLO
// Basado en: backend/prisma/schema.prisma model AsignacionAtletaMicrociclo
// ===================================

export const asignacionSchema = z.object({
  id: z.string(),
  atletaId: z.string(),
  microcicloId: z.string(),
  asignadoPor: z.string(),
  fechaAsignacion: z.coerce.date(),
  activa: z.boolean(),
  observaciones: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  // Relaciones opcionales
  atleta: z
    .object({
      id: z.string(),
      nombreCompleto: z.string(),
    })
    .optional(),
  microciclo: z
    .object({
      id: z.string(),
      numeroGlobalMicrociclo: z.number().int(),
      fechaInicio: z.coerce.date(),
      fechaFin: z.coerce.date(),
    })
    .optional(),
  asignador: z
    .object({
      id: z.string(),
      nombreCompleto: z.string(),
    })
    .optional(),
});

export type Asignacion = z.infer<typeof asignacionSchema>;

// ===================================
// ENTRENADOR (solo lectura para CT)
// Basado en: backend/prisma/schema.prisma model Entrenador
// ===================================

export const entrenadorResumenSchema = z.object({
  id: z.string(),
  usuarioId: z.string(),
  municipio: z.string(),
  especialidad: z.string().nullable(),
  createdAt: z.coerce.date(),
  usuario: z.object({
    id: z.string(),
    nombreCompleto: z.string(),
    email: z.string(),
    estado: z.boolean(),
  }),
  atletasAsignadosCount: z.number().int().optional(),
});

export type EntrenadorResumen = z.infer<typeof entrenadorResumenSchema>;
