'use client';

import { useActionState, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SelectAtleta } from './select-atleta';
import { SubmitButton } from './submit-button';
import { createTestFisico } from '../../actions/create-test-fisico';
import { initialActionState } from '@/types/action-result';
import { Dumbbell, Timer, FileText } from 'lucide-react';
import { ENTRENADOR_ROUTES } from '@/lib/routes';

interface Atleta {
  id: string;
  nombreCompleto: string;
}

interface CreateTestFormProps {
  atletas: Atleta[];
}

// Formulario para crear un test fisico
export function CreateTestForm({ atletas }: CreateTestFormProps) {
  const router = useRouter();
  const hasShownToast = useRef(false);
  const [state, formAction] = useActionState(createTestFisico, initialActionState);
  const [selectedAtleta, setSelectedAtleta] = useState('');

  // Obtener fecha actual en formato YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  // Mostrar toast y redirigir en caso de exito
  useEffect(() => {
    if (state.success && state.message && !hasShownToast.current) {
      hasShownToast.current = true;
      toast.success('Test fisico registrado', {
        description: state.message,
      });
      router.push(ENTRENADOR_ROUTES.testsFisicos.list);
    }
  }, [state, router]);

  // Mostrar toast en caso de error
  useEffect(() => {
    if (!state.success && state.error) {
      toast.error('Error', {
        description: state.error,
      });
    }
  }, [state]);

  // Obtener error de un campo especifico
  const getFieldError = (field: string): string | undefined => {
    if (!state.success && state.fieldErrors) {
      return state.fieldErrors[field]?.[0];
    }
    return undefined;
  };

  // Obtener valor previo de un campo (para preservar datos al haber error)
  const getPreviousValue = (field: string): string => {
    if (!state.success && state.submittedData) {
      const value = state.submittedData[field];
      return value !== undefined && value !== null ? String(value) : '';
    }
    return '';
  };

  // Restaurar atleta seleccionado si hay error
  useEffect(() => {
    if (!state.success && state.submittedData?.atletaId) {
      setSelectedAtleta(String(state.submittedData.atletaId));
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
      {/* Seccion: Atleta y Fecha */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Datos Generales</CardTitle>
          <CardDescription>Selecciona el atleta y la fecha del test</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <SelectAtleta
            atletas={atletas}
            value={selectedAtleta}
            onValueChange={setSelectedAtleta}
            error={getFieldError('atletaId')}
          />
          <input type="hidden" name="atletaId" value={selectedAtleta} />

          <div className="space-y-2">
            <Label htmlFor="fechaTest">Fecha del Test *</Label>
            <Input
              type="date"
              id="fechaTest"
              name="fechaTest"
              defaultValue={getPreviousValue('fechaTest') || today}
              max={today}
              className={getFieldError('fechaTest') ? 'border-destructive' : ''}
            />
            {getFieldError('fechaTest') && (
              <p className="text-sm text-destructive">{getFieldError('fechaTest')}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Seccion: Fuerza Maxima */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            Fuerza Maxima (1RM)
          </CardTitle>
          <CardDescription>Tests de fuerza maxima en kilogramos</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="pressBanca">Press Banca (kg)</Label>
            <Input
              type="number"
              id="pressBanca"
              name="pressBanca"
              placeholder="0"
              min="0"
              max="300"
              step="0.5"
              defaultValue={getPreviousValue('pressBanca')}
              className={getFieldError('pressBanca') ? 'border-destructive' : ''}
            />
            {getFieldError('pressBanca') && (
              <p className="text-sm text-destructive">{getFieldError('pressBanca')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tiron">Tiron (kg)</Label>
            <Input
              type="number"
              id="tiron"
              name="tiron"
              placeholder="0"
              min="0"
              max="400"
              step="0.5"
              defaultValue={getPreviousValue('tiron')}
              className={getFieldError('tiron') ? 'border-destructive' : ''}
            />
            {getFieldError('tiron') && (
              <p className="text-sm text-destructive">{getFieldError('tiron')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sentadilla">Sentadilla (kg)</Label>
            <Input
              type="number"
              id="sentadilla"
              name="sentadilla"
              placeholder="0"
              min="0"
              max="400"
              step="0.5"
              defaultValue={getPreviousValue('sentadilla')}
              className={getFieldError('sentadilla') ? 'border-destructive' : ''}
            />
            {getFieldError('sentadilla') && (
              <p className="text-sm text-destructive">{getFieldError('sentadilla')}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Seccion: Fuerza Resistencia */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            Fuerza Resistencia
          </CardTitle>
          <CardDescription>Tests de repeticiones maximas</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="barraFija">Barra Fija (repeticiones)</Label>
            <Input
              type="number"
              id="barraFija"
              name="barraFija"
              placeholder="0"
              min="0"
              max="100"
              step="1"
              defaultValue={getPreviousValue('barraFija')}
              className={getFieldError('barraFija') ? 'border-destructive' : ''}
            />
            {getFieldError('barraFija') && (
              <p className="text-sm text-destructive">{getFieldError('barraFija')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="paralelas">Paralelas (repeticiones)</Label>
            <Input
              type="number"
              id="paralelas"
              name="paralelas"
              placeholder="0"
              min="0"
              max="100"
              step="1"
              defaultValue={getPreviousValue('paralelas')}
              className={getFieldError('paralelas') ? 'border-destructive' : ''}
            />
            {getFieldError('paralelas') && (
              <p className="text-sm text-destructive">{getFieldError('paralelas')}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Seccion: Resistencia Aerobica */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Resistencia Aerobica
          </CardTitle>
          <CardDescription>Tests de capacidad aerobica</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="navettePalier">Test Navette (Palier)</Label>
            <Input
              type="number"
              id="navettePalier"
              name="navettePalier"
              placeholder="0"
              min="0"
              max="20"
              step="0.5"
              defaultValue={getPreviousValue('navettePalier')}
              className={getFieldError('navettePalier') ? 'border-destructive' : ''}
            />
            {getFieldError('navettePalier') && (
              <p className="text-sm text-destructive">{getFieldError('navettePalier')}</p>
            )}
            <p className="text-xs text-muted-foreground">
              El VO2max se calculara automaticamente
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="test1500m">Test 1500m (MM:SS)</Label>
            <Input
              type="text"
              id="test1500m"
              name="test1500m"
              placeholder="05:30"
              maxLength={10}
              defaultValue={getPreviousValue('test1500m')}
              className={getFieldError('test1500m') ? 'border-destructive' : ''}
            />
            {getFieldError('test1500m') && (
              <p className="text-sm text-destructive">{getFieldError('test1500m')}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Seccion: Observaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Observaciones
          </CardTitle>
          <CardDescription>Notas adicionales sobre el test</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="condicionesTest">Condiciones del Test</Label>
            <textarea
              id="condicionesTest"
              name="condicionesTest"
              rows={2}
              maxLength={500}
              placeholder="Ej: Atleta descansado, buena hidratacion..."
              defaultValue={getPreviousValue('condicionesTest')}
              className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones Generales</Label>
            <textarea
              id="observaciones"
              name="observaciones"
              rows={3}
              maxLength={1000}
              placeholder="Notas sobre el desempeno, areas a mejorar..."
              defaultValue={getPreviousValue('observaciones')}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </CardContent>
      </Card>

      {/* Boton Submit */}
      <div className="flex justify-end gap-4">
        <SubmitButton pendingText="Guardando test...">
          Guardar Test Fisico
        </SubmitButton>
      </div>
    </form>
  );
}
