'use client';

import { useActionState, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SubmitButton } from './submit-button';
import { updateMesociclo } from '../../actions/mesociclo.actions';
import { initialActionState } from '@/types/action-result';
import { AlertCircle, Target, CheckCircle, Layers, Save } from 'lucide-react';
import { EtapaMesocicloValues } from '@/types/enums';
import type { Mesociclo } from '../../types/planificacion.types';

interface EditMesocicloFormProps {
  mesociclo: Mesociclo;
}

// Formulario para editar un mesociclo existente
export function EditMesocicloForm({ mesociclo }: EditMesocicloFormProps) {
  // Bind del action con el ID del mesociclo
  const updateWithId = updateMesociclo.bind(null, mesociclo.id);
  const [state, formAction] = useActionState(updateWithId, initialActionState);
  const [selectedEtapa, setSelectedEtapa] = useState(mesociclo.etapa);

  // Obtener error de un campo especifico
  const getFieldError = (field: string): string | undefined => {
    if (!state.success && state.fieldErrors) {
      return state.fieldErrors[field]?.[0];
    }
    return undefined;
  };

  // Formatear fecha para input date
  const formatDateForInput = (date: Date | string) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
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

      {/* Datos Generales */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Datos del Mesociclo
          </CardTitle>
          <CardDescription>Informacion basica del mesociclo</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              type="text"
              id="nombre"
              name="nombre"
              defaultValue={mesociclo.nombre}
              placeholder="Ej: Preparacion General 1"
              className={getFieldError('nombre') ? 'border-destructive' : ''}
            />
            {getFieldError('nombre') && (
              <p className="text-sm text-destructive">{getFieldError('nombre')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="numeroMesociclo">Numero de Mesociclo *</Label>
            <Input
              type="number"
              id="numeroMesociclo"
              name="numeroMesociclo"
              min="1"
              defaultValue={mesociclo.numeroMesociclo}
              className={getFieldError('numeroMesociclo') ? 'border-destructive' : ''}
            />
            {getFieldError('numeroMesociclo') && (
              <p className="text-sm text-destructive">{getFieldError('numeroMesociclo')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Etapa *</Label>
            <Select
              value={selectedEtapa}
              onValueChange={setSelectedEtapa}
            >
              <SelectTrigger className={getFieldError('etapa') ? 'border-destructive' : ''}>
                <SelectValue placeholder="Selecciona una etapa" />
              </SelectTrigger>
              <SelectContent>
                {EtapaMesocicloValues.map((etapa) => (
                  <SelectItem key={etapa} value={etapa}>
                    {etapa.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="etapa" value={selectedEtapa} />
            {getFieldError('etapa') && (
              <p className="text-sm text-destructive">{getFieldError('etapa')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Macrociclo</Label>
            <Input
              type="text"
              value={mesociclo.macrociclo?.nombre || 'No asignado'}
              disabled
              className="bg-muted"
            />
            <input type="hidden" name="macrocicloId" value={mesociclo.macrocicloId} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaInicio">Fecha Inicio *</Label>
            <Input
              type="date"
              id="fechaInicio"
              name="fechaInicio"
              defaultValue={formatDateForInput(mesociclo.fechaInicio)}
              className={getFieldError('fechaInicio') ? 'border-destructive' : ''}
            />
            {getFieldError('fechaInicio') && (
              <p className="text-sm text-destructive">{getFieldError('fechaInicio')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaFin">Fecha Fin *</Label>
            <Input
              type="date"
              id="fechaFin"
              name="fechaFin"
              defaultValue={formatDateForInput(mesociclo.fechaFin)}
              className={getFieldError('fechaFin') ? 'border-destructive' : ''}
            />
            {getFieldError('fechaFin') && (
              <p className="text-sm text-destructive">{getFieldError('fechaFin')}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Objetivos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Objetivos
          </CardTitle>
          <CardDescription>Define los objetivos del mesociclo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="objetivoFisico">Objetivo Fisico *</Label>
            <Textarea
              id="objetivoFisico"
              name="objetivoFisico"
              defaultValue={mesociclo.objetivoFisico}
              rows={2}
              className={getFieldError('objetivoFisico') ? 'border-destructive' : ''}
            />
            {getFieldError('objetivoFisico') && (
              <p className="text-sm text-destructive">{getFieldError('objetivoFisico')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="objetivoTecnico">Objetivo Tecnico *</Label>
            <Textarea
              id="objetivoTecnico"
              name="objetivoTecnico"
              defaultValue={mesociclo.objetivoTecnico}
              rows={2}
              className={getFieldError('objetivoTecnico') ? 'border-destructive' : ''}
            />
            {getFieldError('objetivoTecnico') && (
              <p className="text-sm text-destructive">{getFieldError('objetivoTecnico')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="objetivoTactico">Objetivo Tactico *</Label>
            <Textarea
              id="objetivoTactico"
              name="objetivoTactico"
              defaultValue={mesociclo.objetivoTactico}
              rows={2}
              className={getFieldError('objetivoTactico') ? 'border-destructive' : ''}
            />
            {getFieldError('objetivoTactico') && (
              <p className="text-sm text-destructive">{getFieldError('objetivoTactico')}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Boton de envio */}
      <div className="flex justify-end">
        <SubmitButton pendingText="Guardando...">
          <Save className="mr-2 h-4 w-4" />
          Guardar Cambios
        </SubmitButton>
      </div>
    </form>
  );
}
