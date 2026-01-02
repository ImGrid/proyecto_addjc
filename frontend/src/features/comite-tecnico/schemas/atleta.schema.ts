import { z } from 'zod';
import { CategoriaPesoValues } from '@/types/enums';

// Schema para crear atleta
// Basado EXACTAMENTE en: backend/src/modules/atletas/dto/create-atleta.dto.ts

export const createAtletaSchema = z.object({
  // Datos del usuario (se crea automaticamente con rol ATLETA)
  ci: z
    .string()
    .min(5, 'CI debe tener al menos 5 caracteres')
    .max(20, 'CI no puede exceder 20 caracteres'),

  nombreCompleto: z
    .string()
    .min(3, 'Nombre debe tener al menos 3 caracteres')
    .max(255, 'Nombre no puede exceder 255 caracteres'),

  email: z
    .string()
    .email('Email invalido')
    .max(255, 'Email no puede exceder 255 caracteres'),

  contrasena: z
    .string()
    .min(8, 'Contrasena debe tener al menos 8 caracteres')
    .max(100, 'Contrasena no puede exceder 100 caracteres'),

  // Datos del atleta
  municipio: z.string().max(100, 'Municipio no puede exceder 100 caracteres'),

  club: z.string().max(100, 'Club no puede exceder 100 caracteres'),

  categoria: z.string().max(50, 'Categoria no puede exceder 50 caracteres'),

  peso: z.string().max(20, 'Peso no puede exceder 20 caracteres'),

  fechaNacimiento: z.string().min(1, 'Fecha de nacimiento es requerida'),

  edad: z.coerce.number().int().min(5, 'Edad minima es 5 anios'),

  // Campos opcionales
  direccion: z.string().optional(),

  telefono: z.string().max(50, 'Telefono no puede exceder 50 caracteres').optional(),

  entrenadorAsignadoId: z.string().optional(),

  categoriaPeso: z.enum(CategoriaPesoValues as [string, ...string[]]).optional(),

  pesoActual: z.coerce.number().positive('Peso actual debe ser positivo').optional(),

  fcReposo: z.coerce.number().int().positive('FC reposo debe ser positivo').optional(),
});

export type CreateAtletaInput = z.infer<typeof createAtletaSchema>;

// Schema para actualizar atleta (todos los campos opcionales excepto contrasena que se omite)
export const updateAtletaSchema = createAtletaSchema.partial().omit({ contrasena: true });

export type UpdateAtletaInput = z.infer<typeof updateAtletaSchema>;
