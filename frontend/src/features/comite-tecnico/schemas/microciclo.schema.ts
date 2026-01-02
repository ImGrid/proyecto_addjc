import { z } from 'zod';
import { TipoMicrocicloValues, SentidoCargaValues, CreadoPorValues } from '@/types/enums';

// Schema para crear microciclo
// Basado EXACTAMENTE en: backend/src/modules/planificacion/dto/create-microciclo.dto.ts

export const createMicrocicloSchema = z
  .object({
    // mesocicloId es OPCIONAL (segun schema.prisma y DTO del backend)
    mesocicloId: z.string().optional(),

    numeroMicrociclo: z.coerce.number().int().min(1).optional(),

    numeroGlobalMicrociclo: z.coerce
      .number()
      .int()
      .min(1, 'El numero global debe ser al menos 1'),

    fechaInicio: z.string().min(1, 'Fecha de inicio es requerida'),

    fechaFin: z.string().min(1, 'Fecha de fin es requerida'),

    tipoMicrociclo: z.enum(TipoMicrocicloValues as [string, ...string[]]),

    volumenTotal: z.coerce.number().min(0, 'El volumen debe ser positivo'),

    intensidadPromedio: z.coerce
      .number()
      .min(0, 'La intensidad debe ser positiva')
      .max(100, 'La intensidad no puede exceder 100'),

    objetivoSemanal: z.string().min(1, 'El objetivo semanal es requerido'),

    observaciones: z.string().optional(),

    creadoPor: z.enum(CreadoPorValues as [string, ...string[]]).optional(),

    // Campos de carga (opcionales)
    mediaVolumen: z.coerce.number().optional(),

    mediaIntensidad: z.coerce.number().optional(),

    sentidoVolumen: z.enum(SentidoCargaValues as [string, ...string[]]).optional(),

    sentidoIntensidad: z.enum(SentidoCargaValues as [string, ...string[]]).optional(),

    // Cargas semanales (opcionales)
    vCarga1: z.coerce.number().optional(),
    vCarga1Nivel: z.coerce.number().int().optional(),
    iCarga1: z.coerce.number().optional(),
    iCarga1Nivel: z.coerce.number().int().optional(),
    vCarga2: z.coerce.number().optional(),
    vCarga2Nivel: z.coerce.number().int().optional(),
    iCarga2: z.coerce.number().optional(),
    iCarga2Nivel: z.coerce.number().int().optional(),
  })
  .refine((data) => new Date(data.fechaFin) > new Date(data.fechaInicio), {
    message: 'La fecha de fin debe ser posterior a la fecha de inicio',
    path: ['fechaFin'],
  });

export type CreateMicrocicloInput = z.infer<typeof createMicrocicloSchema>;

// Schema para actualizar microciclo
export const updateMicrocicloSchema = z
  .object({
    mesocicloId: z.string().optional(),

    numeroMicrociclo: z.coerce.number().int().min(1).optional(),

    numeroGlobalMicrociclo: z.coerce.number().int().min(1).optional(),

    fechaInicio: z.string().optional(),

    fechaFin: z.string().optional(),

    tipoMicrociclo: z.enum(TipoMicrocicloValues as [string, ...string[]]).optional(),

    volumenTotal: z.coerce.number().min(0).optional(),

    intensidadPromedio: z.coerce.number().min(0).max(100).optional(),

    objetivoSemanal: z.string().optional(),

    observaciones: z.string().optional(),

    creadoPor: z.enum(CreadoPorValues as [string, ...string[]]).optional(),

    mediaVolumen: z.coerce.number().optional(),

    mediaIntensidad: z.coerce.number().optional(),

    sentidoVolumen: z.enum(SentidoCargaValues as [string, ...string[]]).optional(),

    sentidoIntensidad: z.enum(SentidoCargaValues as [string, ...string[]]).optional(),

    vCarga1: z.coerce.number().optional(),
    vCarga1Nivel: z.coerce.number().int().optional(),
    iCarga1: z.coerce.number().optional(),
    iCarga1Nivel: z.coerce.number().int().optional(),
    vCarga2: z.coerce.number().optional(),
    vCarga2Nivel: z.coerce.number().int().optional(),
    iCarga2: z.coerce.number().optional(),
    iCarga2Nivel: z.coerce.number().int().optional(),
  })
  .refine(
    (data) => {
      if (data.fechaInicio && data.fechaFin) {
        return new Date(data.fechaFin) > new Date(data.fechaInicio);
      }
      return true;
    },
    {
      message: 'La fecha de fin debe ser posterior a la fecha de inicio',
      path: ['fechaFin'],
    }
  );

export type UpdateMicrocicloInput = z.infer<typeof updateMicrocicloSchema>;
