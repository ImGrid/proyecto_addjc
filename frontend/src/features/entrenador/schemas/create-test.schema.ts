import { z } from 'zod';

// Schema para crear un test fisico
// Basado en: backend/src/modules/testing/dto/create-test-fisico.dto.ts
// Nota: Zod 4 no soporta required_error/invalid_type_error como en Zod 3
export const createTestSchema = z.object({
  // IDs de relaciones
  atletaId: z.coerce.number().int().positive('El ID del atleta debe ser positivo'),

  sesionId: z.coerce.number().int().positive().optional(),

  microcicloId: z.coerce.number().int().positive().optional(),

  // Fecha del test (requerido por el backend)
  fechaTest: z.string().min(1, 'La fecha del test es requerida'),

  // Tests de fuerza maxima (1RM) - kg
  pressBanca: z.union([
    z.coerce.number().min(0, 'Press banca no puede ser negativo').max(300, 'Press banca no puede exceder 300 kg'),
    z.literal(''),
  ]).optional(),

  tiron: z.union([
    z.coerce.number().min(0, 'Tiron no puede ser negativo').max(400, 'Tiron no puede exceder 400 kg'),
    z.literal(''),
  ]).optional(),

  sentadilla: z.union([
    z.coerce.number().min(0, 'Sentadilla no puede ser negativo').max(400, 'Sentadilla no puede exceder 400 kg'),
    z.literal(''),
  ]).optional(),

  // Tests de fuerza resistencia - repeticiones (enteros)
  barraFija: z.union([
    z.coerce.number().int('Barra fija debe ser entero').min(0, 'Barra fija no puede ser negativo').max(100, 'Barra fija no puede exceder 100'),
    z.literal(''),
  ]).optional(),

  paralelas: z.union([
    z.coerce.number().int('Paralelas debe ser entero').min(0, 'Paralelas no puede ser negativo').max(100, 'Paralelas no puede exceder 100'),
    z.literal(''),
  ]).optional(),

  // Tests de resistencia aerobica
  navettePalier: z.union([
    z.coerce.number().min(0, 'Navette palier no puede ser negativo').max(20, 'Navette palier no puede exceder 20'),
    z.literal(''),
  ]).optional(),

  test1500m: z.string().max(10, 'Formato invalido para test 1500m').optional(),

  // Observaciones
  observaciones: z.string().max(1000, 'Las observaciones no pueden exceder 1000 caracteres').optional(),

  condicionesTest: z.string().max(500, 'Las condiciones del test no pueden exceder 500 caracteres').optional(),
}).refine(
  (data) => {
    // Al menos un test debe tener valor
    const hasPressBanca = data.pressBanca !== undefined && data.pressBanca !== '';
    const hasTiron = data.tiron !== undefined && data.tiron !== '';
    const hasSentadilla = data.sentadilla !== undefined && data.sentadilla !== '';
    const hasBarraFija = data.barraFija !== undefined && data.barraFija !== '';
    const hasParalelas = data.paralelas !== undefined && data.paralelas !== '';
    const hasNavette = data.navettePalier !== undefined && data.navettePalier !== '';
    const hasTest1500 = data.test1500m !== undefined && data.test1500m !== '';

    return hasPressBanca || hasTiron || hasSentadilla ||
           hasBarraFija || hasParalelas || hasNavette || hasTest1500;
  },
  {
    message: 'Debes completar al menos un tipo de test',
    path: ['_form'],
  }
);

export type CreateTestInput = z.infer<typeof createTestSchema>;

// Tipo para enviar al backend (limpiando strings vacios)
export type CreateTestPayload = {
  atletaId: number;
  fechaTest: string;
  sesionId?: number;
  microcicloId?: number;
  pressBanca?: number;
  tiron?: number;
  sentadilla?: number;
  barraFija?: number;
  paralelas?: number;
  navettePalier?: number;
  test1500m?: string;
  observaciones?: string;
  condicionesTest?: string;
};
