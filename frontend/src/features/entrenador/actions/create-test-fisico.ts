'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createTestSchema, CreateTestPayload } from '../schemas/create-test.schema';
import { ActionResult } from '@/types/action-result';

// Server Action para crear un test fisico
// Endpoint: POST /tests-fisicos
export async function createTestFisico(
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
      fechaTest: formData.get('fechaTest'),
      pressBanca: formData.get('pressBanca'),
      tiron: formData.get('tiron'),
      sentadilla: formData.get('sentadilla'),
      barraFija: formData.get('barraFija'),
      paralelas: formData.get('paralelas'),
      navettePalier: formData.get('navettePalier'),
      test1500m: formData.get('test1500m'),
      observaciones: formData.get('observaciones'),
      condicionesTest: formData.get('condicionesTest'),
    };

    // Validar con Zod
    const validation = createTestSchema.safeParse(rawData);

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

      // Verificar si es error del refine (_form)
      const formError = fieldErrors['_form'];
      if (formError) {
        return {
          success: false,
          error: formError[0],
          fieldErrors,
        };
      }

      return {
        success: false,
        error: 'Por favor corrige los errores del formulario',
        fieldErrors,
      };
    }

    // Limpiar payload (eliminar strings vacios y convertir a tipos correctos)
    const payload: CreateTestPayload = {
      atletaId: validation.data.atletaId,
      fechaTest: validation.data.fechaTest,
    };

    // Solo agregar campos que tengan valor
    if (validation.data.pressBanca !== undefined && validation.data.pressBanca !== '') {
      payload.pressBanca = Number(validation.data.pressBanca);
    }
    if (validation.data.tiron !== undefined && validation.data.tiron !== '') {
      payload.tiron = Number(validation.data.tiron);
    }
    if (validation.data.sentadilla !== undefined && validation.data.sentadilla !== '') {
      payload.sentadilla = Number(validation.data.sentadilla);
    }
    if (validation.data.barraFija !== undefined && validation.data.barraFija !== '') {
      payload.barraFija = Number(validation.data.barraFija);
    }
    if (validation.data.paralelas !== undefined && validation.data.paralelas !== '') {
      payload.paralelas = Number(validation.data.paralelas);
    }
    if (validation.data.navettePalier !== undefined && validation.data.navettePalier !== '') {
      payload.navettePalier = Number(validation.data.navettePalier);
    }
    if (validation.data.test1500m && validation.data.test1500m.trim() !== '') {
      payload.test1500m = validation.data.test1500m.trim();
    }
    if (validation.data.observaciones && validation.data.observaciones.trim() !== '') {
      payload.observaciones = validation.data.observaciones.trim();
    }
    if (validation.data.condicionesTest && validation.data.condicionesTest.trim() !== '') {
      payload.condicionesTest = validation.data.condicionesTest.trim();
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

    const response = await fetch(`${API_URL}/tests-fisicos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('[createTestFisico] Error del backend:', response.status, errorData);

      // Manejar errores especificos del backend
      if (response.status === 403) {
        return {
          success: false,
          error: 'No tienes permiso para registrar tests de este atleta',
        };
      }
      if (response.status === 404) {
        return {
          success: false,
          error: 'Atleta no encontrado',
        };
      }

      return {
        success: false,
        error: errorData?.message || 'Error al crear el test fisico',
      };
    }

    const result = await response.json();
    console.log('[createTestFisico] Test creado:', result.id);

    // Revalidar las rutas afectadas
    revalidatePath('/entrenador/tests-fisicos');
    revalidatePath('/entrenador');
    revalidatePath(`/entrenador/mis-atletas/${validation.data.atletaId}`);

  } catch (error) {
    console.error('[createTestFisico] Error:', error);
    return {
      success: false,
      error: 'Error de conexion. Intenta nuevamente.',
    };
  }

  // Redirigir fuera del try-catch (Next.js requirement)
  redirect('/entrenador/tests-fisicos');
}
