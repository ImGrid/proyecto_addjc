'use server';

import { cookies } from 'next/headers';
import { SesionResumen, sesionResumenSchema } from '../types/entrenador.types';
import { z } from 'zod';

// Schema para validar respuesta de sesiones del backend
const sesionesResponseSchema = z.object({
  data: z.array(z.object({
    id: z.string(),
    fecha: z.coerce.date(),
    numeroSesion: z.number().int(),
    tipoSesion: z.string(),
    duracionPlanificada: z.number().nullable().optional(),
    microciclo: z.object({
      id: z.string(),
      numeroGlobalMicrociclo: z.number().int(),
    }).optional(),
  })),
  meta: z.object({
    total: z.number().int(),
    page: z.number().int(),
    limit: z.number().int(),
  }),
});

// Tipo para sesion en selector (version simplificada para dropdown)
export interface SesionParaSelector {
  id: string;
  label: string; // Ej: "Sesion #3 - 25/12/2024 (Entrenamiento)"
  fecha: Date;
  numeroSesion: number;
  tipoSesion: string;
  microcicloNumero?: number;
}

// Server Action para obtener sesiones disponibles para el entrenador
// Endpoint: GET /sesiones
export async function fetchSesionesParaSelector(limit: number = 50): Promise<SesionParaSelector[] | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return null;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

    const response = await fetch(`${API_URL}/sesiones?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('[fetchSesionesParaSelector] Error:', response.status);
      return null;
    }

    const data = await response.json();
    const parsed = sesionesResponseSchema.safeParse(data);

    if (!parsed.success) {
      console.error('[fetchSesionesParaSelector] Validation error:', parsed.error.issues);
      return null;
    }

    // Transformar a formato para selector
    const sesiones: SesionParaSelector[] = parsed.data.data.map((s) => {
      const fechaFormateada = s.fecha.toLocaleDateString('es-BO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

      const tipoSesionFormateado = s.tipoSesion.replace(/_/g, ' ');
      const microcicloInfo = s.microciclo ? ` - Micro #${s.microciclo.numeroGlobalMicrociclo}` : '';

      return {
        id: s.id,
        label: `Sesion #${s.numeroSesion} - ${fechaFormateada} (${tipoSesionFormateado})${microcicloInfo}`,
        fecha: s.fecha,
        numeroSesion: s.numeroSesion,
        tipoSesion: s.tipoSesion,
        microcicloNumero: s.microciclo?.numeroGlobalMicrociclo,
      };
    });

    // Ordenar por fecha descendente (mas recientes primero)
    sesiones.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

    return sesiones;
  } catch (error) {
    console.error('[fetchSesionesParaSelector] Error:', error);
    return null;
  }
}
