'use client';

import { useActionState, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { SubmitButton } from './submit-button';
import { createAsignacion } from '../../actions/asignacion.actions';
import { initialActionState } from '@/types/action-result';
import { AlertCircle, Link as LinkIcon, CheckCircle } from 'lucide-react';

interface Atleta {
  id: string;
  nombreCompleto: string;
}

interface Microciclo {
  id: string;
  numeroGlobalMicrociclo: number;
  fechaInicio: Date;
  fechaFin: Date;
}

interface CreateAsignacionFormProps {
  atletas: Atleta[];
  microciclos: Microciclo[];
}

// Formulario para crear una asignacion atleta-microciclo
export function CreateAsignacionForm({ atletas, microciclos }: CreateAsignacionFormProps) {
  const [state, formAction] = useActionState(createAsignacion, initialActionState);
  const [selectedAtleta, setSelectedAtleta] = useState('');
  const [selectedMicrociclo, setSelectedMicrociclo] = useState('');

  // Obtener error de un campo especifico
  const getFieldError = (field: string): string | undefined => {
    if (!state.success && state.fieldErrors) {
      return state.fieldErrors[field]?.[0];
    }
    return undefined;
  };

  // Formatear fecha para mostrar
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
    });
  };

  return (
    <form action={formAction} className="space-y-6">
      {/* Mensaje de exito */}
      {state.success && state.message && (
        <Alert className="border-green-500 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-700">{state.message}</AlertDescription>
        </Alert>
      )}

      {/* Error general */}
      {!state.success && state.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Nueva Asignacion
          </CardTitle>
          <CardDescription>Asigna un atleta a un microciclo de entrenamiento</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Atleta *</Label>
            <Select
              value={selectedAtleta}
              onValueChange={setSelectedAtleta}
            >
              <SelectTrigger className={getFieldError('atletaId') ? 'border-destructive' : ''}>
                <SelectValue placeholder="Selecciona un atleta" />
              </SelectTrigger>
              <SelectContent>
                {atletas.map((atleta) => (
                  <SelectItem key={atleta.id} value={atleta.id}>
                    {atleta.nombreCompleto}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="atletaId" value={selectedAtleta} />
            {getFieldError('atletaId') && (
              <p className="text-sm text-destructive">{getFieldError('atletaId')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Microciclo *</Label>
            <Select
              value={selectedMicrociclo}
              onValueChange={setSelectedMicrociclo}
            >
              <SelectTrigger className={getFieldError('microcicloId') ? 'border-destructive' : ''}>
                <SelectValue placeholder="Selecciona un microciclo" />
              </SelectTrigger>
              <SelectContent>
                {microciclos.map((micro) => (
                  <SelectItem key={micro.id} value={micro.id}>
                    Microciclo {micro.numeroGlobalMicrociclo} ({formatDate(micro.fechaInicio)} - {formatDate(micro.fechaFin)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="microcicloId" value={selectedMicrociclo} />
            {getFieldError('microcicloId') && (
              <p className="text-sm text-destructive">{getFieldError('microcicloId')}</p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="observaciones">Observaciones (opcional)</Label>
            <Input
              type="text"
              id="observaciones"
              name="observaciones"
              placeholder="Notas adicionales sobre la asignacion"
              maxLength={500}
            />
          </div>
        </CardContent>
      </Card>

      {/* Boton de envio */}
      <div className="flex justify-end">
        <SubmitButton pendingText="Asignando...">
          <LinkIcon className="mr-2 h-4 w-4" />
          Crear Asignacion
        </SubmitButton>
      </div>
    </form>
  );
}
