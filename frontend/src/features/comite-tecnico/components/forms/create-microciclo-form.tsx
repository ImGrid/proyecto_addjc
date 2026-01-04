'use client';

import { useActionState, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SubmitButton } from './submit-button';
import { createMicrociclo } from '../../actions/microciclo.actions';
import { initialActionState } from '@/types/action-result';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Target, Activity, Info } from 'lucide-react';
import { TipoMicrocicloValues } from '@/types/enums';
import { COMITE_TECNICO_ROUTES } from '@/lib/routes';
import type { Mesociclo } from '../../types/planificacion.types';

interface CreateMicrocicloFormProps {
  mesociclos: Pick<Mesociclo, 'id' | 'nombre' | 'etapa'>[];
  preselectedMesocicloId?: string;
}

// Formulario para crear un nuevo microciclo
// NOTA: El backend genera automaticamente 7 sesiones al crear el microciclo
export function CreateMicrocicloForm({ mesociclos, preselectedMesocicloId }: CreateMicrocicloFormProps) {
  const router = useRouter();
  const hasShownToast = useRef(false);
  const [state, formAction] = useActionState(createMicrociclo, initialActionState);
  const [selectedMesociclo, setSelectedMesociclo] = useState(preselectedMesocicloId || '');
  const [selectedTipo, setSelectedTipo] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  // Mostrar toast y redirigir en caso de exito
  useEffect(() => {
    if (state.success && state.message && !hasShownToast.current) {
      hasShownToast.current = true;
      toast.success('Microciclo creado', {
        description: state.message,
      });
      router.push(COMITE_TECNICO_ROUTES.planificacion.microciclos.list);
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

  // Calcular fechaFin automaticamente (fechaInicio + 6 dias = 7 dias totales)
  useEffect(() => {
    if (fechaInicio) {
      const inicio = new Date(fechaInicio);
      const fin = new Date(inicio);
      fin.setDate(fin.getDate() + 6);
      setFechaFin(fin.toISOString().split('T')[0]);
    }
  }, [fechaInicio]);

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

  // Restaurar valores de selects y fechas si hay error
  useEffect(() => {
    if (!state.success && state.submittedData) {
      if (state.submittedData.mesocicloId) {
        setSelectedMesociclo(String(state.submittedData.mesocicloId));
      }
      if (state.submittedData.tipoMicrociclo) {
        setSelectedTipo(String(state.submittedData.tipoMicrociclo));
      }
      if (state.submittedData.fechaInicio) {
        setFechaInicio(String(state.submittedData.fechaInicio));
      }
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
      {/* Informacion importante */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Un microciclo representa una semana de entrenamiento (7 dias).
          Al crearlo, se generaran automaticamente 7 sesiones.
        </AlertDescription>
      </Alert>

      {/* Datos Generales */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Datos del Microciclo
          </CardTitle>
          <CardDescription>Informacion basica del microciclo semanal</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Mesociclo (opcional)</Label>
            <Select
              value={selectedMesociclo}
              onValueChange={setSelectedMesociclo}
            >
              <SelectTrigger className={getFieldError('mesocicloId') ? 'border-destructive' : ''}>
                <SelectValue placeholder="Selecciona un mesociclo" />
              </SelectTrigger>
              <SelectContent>
                {mesociclos.map((meso) => (
                  <SelectItem key={meso.id} value={meso.id}>
                    {meso.nombre} ({meso.etapa.replace(/_/g, ' ')})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="mesocicloId" value={selectedMesociclo} />
            {getFieldError('mesocicloId') && (
              <p className="text-sm text-destructive">{getFieldError('mesocicloId')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="numeroGlobalMicrociclo">Numero Global *</Label>
            <Input
              type="number"
              id="numeroGlobalMicrociclo"
              name="numeroGlobalMicrociclo"
              min="1"
              placeholder="1"
              defaultValue={getPreviousValue('numeroGlobalMicrociclo')}
              className={getFieldError('numeroGlobalMicrociclo') ? 'border-destructive' : ''}
            />
            {getFieldError('numeroGlobalMicrociclo') && (
              <p className="text-sm text-destructive">{getFieldError('numeroGlobalMicrociclo')}</p>
            )}
            <p className="text-xs text-muted-foreground">Numero unico en toda la planificacion</p>
          </div>

          {selectedMesociclo && (
            <div className="space-y-2">
              <Label htmlFor="numeroMicrociclo">Numero en Mesociclo</Label>
              <Input
                type="number"
                id="numeroMicrociclo"
                name="numeroMicrociclo"
                min="1"
                placeholder="1"
                defaultValue={getPreviousValue('numeroMicrociclo')}
                className={getFieldError('numeroMicrociclo') ? 'border-destructive' : ''}
              />
              {getFieldError('numeroMicrociclo') && (
                <p className="text-sm text-destructive">{getFieldError('numeroMicrociclo')}</p>
              )}
              <p className="text-xs text-muted-foreground">Semana dentro del mesociclo</p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Tipo de Microciclo *</Label>
            <Select
              value={selectedTipo}
              onValueChange={setSelectedTipo}
            >
              <SelectTrigger className={getFieldError('tipoMicrociclo') ? 'border-destructive' : ''}>
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                {TipoMicrocicloValues.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="tipoMicrociclo" value={selectedTipo} />
            {getFieldError('tipoMicrociclo') && (
              <p className="text-sm text-destructive">{getFieldError('tipoMicrociclo')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaInicio">Fecha Inicio (Lunes) *</Label>
            <Input
              type="date"
              id="fechaInicio"
              name="fechaInicio"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className={getFieldError('fechaInicio') ? 'border-destructive' : ''}
            />
            {getFieldError('fechaInicio') && (
              <p className="text-sm text-destructive">{getFieldError('fechaInicio')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaFin">Fecha Fin (Domingo) *</Label>
            <Input
              type="date"
              id="fechaFin"
              name="fechaFin"
              value={fechaFin}
              readOnly
              className="bg-muted"
            />
            {getFieldError('fechaFin') && (
              <p className="text-sm text-destructive">{getFieldError('fechaFin')}</p>
            )}
            <p className="text-xs text-muted-foreground">Se calcula automaticamente (7 dias)</p>
          </div>
        </CardContent>
      </Card>

      {/* Volumen e Intensidad */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Carga de Entrenamiento
          </CardTitle>
          <CardDescription>Define el volumen e intensidad de la semana</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="volumenTotal">Volumen Total *</Label>
            <Input
              type="number"
              id="volumenTotal"
              name="volumenTotal"
              min="0"
              step="0.01"
              placeholder="100"
              defaultValue={getPreviousValue('volumenTotal')}
              className={getFieldError('volumenTotal') ? 'border-destructive' : ''}
            />
            {getFieldError('volumenTotal') && (
              <p className="text-sm text-destructive">{getFieldError('volumenTotal')}</p>
            )}
            <p className="text-xs text-muted-foreground">Unidades de volumen planificadas</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="intensidadPromedio">Intensidad Promedio (%) *</Label>
            <Input
              type="number"
              id="intensidadPromedio"
              name="intensidadPromedio"
              min="0"
              max="100"
              step="0.01"
              placeholder="75"
              defaultValue={getPreviousValue('intensidadPromedio')}
              className={getFieldError('intensidadPromedio') ? 'border-destructive' : ''}
            />
            {getFieldError('intensidadPromedio') && (
              <p className="text-sm text-destructive">{getFieldError('intensidadPromedio')}</p>
            )}
            <p className="text-xs text-muted-foreground">Porcentaje de intensidad (0-100)</p>
          </div>
        </CardContent>
      </Card>

      {/* Objetivo y Observaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Objetivo Semanal
          </CardTitle>
          <CardDescription>Define el objetivo de esta semana de entrenamiento</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="objetivoSemanal">Objetivo *</Label>
            <Textarea
              id="objetivoSemanal"
              name="objetivoSemanal"
              placeholder="Desarrollo de la resistencia especifica, trabajo de nage-komi..."
              rows={3}
              defaultValue={getPreviousValue('objetivoSemanal')}
              className={getFieldError('objetivoSemanal') ? 'border-destructive' : ''}
            />
            {getFieldError('objetivoSemanal') && (
              <p className="text-sm text-destructive">{getFieldError('objetivoSemanal')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones (opcional)</Label>
            <Textarea
              id="observaciones"
              name="observaciones"
              placeholder="Notas adicionales sobre el microciclo..."
              rows={2}
              defaultValue={getPreviousValue('observaciones')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Boton de envio */}
      <div className="flex justify-end">
        <SubmitButton pendingText="Creando...">
          <Calendar className="mr-2 h-4 w-4" />
          Crear Microciclo
        </SubmitButton>
      </div>
    </form>
  );
}
