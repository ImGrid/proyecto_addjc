'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createRegistroSchema, CreateRegistroPayload } from '../schemas/create-registro.schema';
import { ActionResult } from '@/types/action-result';
import { ENTRENADOR_ROUTES } from '@/lib/routes';

// Server Action para crear un registro post-entrenamiento
// Endpoint: POST /registros-post-entrenamiento
export async function createRegistro(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return {
        success: false,
        error: 'No autenticado. Por favor inicia sesion.',
      };
    }

    // Extraer datos del FormData
    const rawData = {
      atletaId: formData.get('atletaId'),
      sesionId: formData.get('sesionId'),
      asistio: formData.get('asistio') === 'true',
      motivoInasistencia: formData.get('motivoInasistencia') || undefined,
      ejerciciosCompletados: formData.get('ejerciciosCompletados'),
      intensidadAlcanzada: formData.get('intensidadAlcanzada'),
      duracionReal: formData.get('duracionReal'),
      rpe: formData.get('rpe'),
      calidadSueno: formData.get('calidadSueno'),
      horasSueno: formData.get('horasSueno') || undefined,
      estadoAnimico: formData.get('estadoAnimico'),
      observaciones: formData.get('observaciones') || undefined,
      // Dolencias se envian como JSON string
      dolencias: formData.get('dolencias')
        ? JSON.parse(formData.get('dolencias') as string)
        : undefined,
    };

    // Validar con Zod
    const validation = createRegistroSchema.safeParse(rawData);

    if (!validation.success) {
      // Convertir errores de Zod a formato de fieldErrors
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of validation.error.issues) {
        const path = issue.path.join('.');
        if (!fieldErrors[path]) {
          fieldErrors[path] = [];
        }
        fieldErrors[path].push(issue.message);
      }

      return {
        success: false,
        error: 'Por favor corrige los errores del formulario',
        fieldErrors,
        submittedData: rawData as Record<string, unknown>,
      };
    }

    // Construir payload para el backend
    const payload: CreateRegistroPayload = {
      atletaId: validation.data.atletaId,
      sesionId: validation.data.sesionId,
      asistio: validation.data.asistio,
      ejerciciosCompletados: validation.data.ejerciciosCompletados,
      intensidadAlcanzada: validation.data.intensidadAlcanzada,
      duracionReal: validation.data.duracionReal,
      rpe: validation.data.rpe,
      calidadSueno: validation.data.calidadSueno,
      estadoAnimico: validation.data.estadoAnimico,
    };

    // Solo agregar campos opcionales que tengan valor
    if (validation.data.motivoInasistencia && validation.data.motivoInasistencia.trim() !== '') {
      payload.motivoInasistencia = validation.data.motivoInasistencia.trim();
    }

    // Manejar horasSueno - puede ser numero o string vacio
    if (validation.data.horasSueno !== undefined && validation.data.horasSueno !== '') {
      payload.horasSueno = Number(validation.data.horasSueno);
    }

    if (validation.data.observaciones && validation.data.observaciones.trim() !== '') {
      payload.observaciones = validation.data.observaciones.trim();
    }

    // Agregar dolencias si existen
    if (validation.data.dolencias && validation.data.dolencias.length > 0) {
      payload.dolencias = validation.data.dolencias.map((d) => ({
        zona: d.zona,
        nivel: d.nivel,
        descripcion: d.descripcion?.trim() || undefined,
        tipoLesion: d.tipoLesion || undefined,
      }));
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

    const response = await fetch(`${API_URL}/registros-post-entrenamiento`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('[createRegistro] Error del backend:', response.status, errorData);

      // Manejar errores especificos del backend
      if (response.status === 403) {
        return {
          success: false,
          error: 'No tienes permiso para registrar datos de este atleta',
          submittedData: rawData as Record<string, unknown>,
        };
      }
      if (response.status === 404) {
        return {
          success: false,
          error: 'Atleta o sesion no encontrada',
          submittedData: rawData as Record<string, unknown>,
        };
      }
      if (response.status === 409) {
        return {
          success: false,
          error: 'Ya existe un registro para esta sesion y atleta',
          submittedData: rawData as Record<string, unknown>,
        };
      }

      return {
        success: false,
        error: errorData?.message || 'Error al crear el registro',
        submittedData: rawData as Record<string, unknown>,
      };
    }

    const result = await response.json();
    console.log('[createRegistro] Registro creado:', result.id);

    // Revalidar las rutas afectadas
    revalidatePath('/entrenador/post-entrenamiento');
    revalidatePath('/entrenador');
    revalidatePath('/entrenador/dolencias');
    revalidatePath(`/entrenador/mis-atletas/${validation.data.atletaId}`);

  } catch (error) {
    console.error('[createRegistro] Error:', error);
    return {
      success: false,
      error: 'Error de conexion. Intenta nuevamente.',
      submittedData: {},
    };
  }

  // Redirigir fuera del try-catch (Next.js requirement)
  redirect(ENTRENADOR_ROUTES.postEntrenamiento.list);
}
