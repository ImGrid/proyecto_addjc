'use client';

import { useActionState, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SubmitButton } from './submit-button';
import { createMesociclo } from '../../actions/mesociclo.actions';
import { initialActionState } from '@/types/action-result';
import { AlertCircle, Calendar, Target, CheckCircle, Layers } from 'lucide-react';
import { EtapaMesocicloValues } from '@/types/enums';
import type { Macrociclo } from '../../types/planificacion.types';
import { useEffect } from 'react';

interface CreateMesocicloFormProps {
  macrociclos: Pick<Macrociclo, 'id' | 'nombre' | 'temporada'>[];
  preselectedMacrocicloId?: string;
}

// Formulario para crear un nuevo mesociclo
export function CreateMesocicloForm({ macrociclos, preselectedMacrocicloId }: CreateMesocicloFormProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(createMesociclo, initialActionState);
  const [selectedMacrociclo, setSelectedMacrociclo] = useState(preselectedMacrocicloId || '');
  const [selectedEtapa, setSelectedEtapa] = useState('');

  // Redirigir si se crea exitosamente
  useEffect(() => {
    if (state.success) {
      router.push('/comite-tecnico/planificacion/mesociclos');
    }
  }, [state.success, router]);

  // Obtener error de un campo especifico
  const getFieldError = (field: string): string | undefined => {
    if (!state.success && state.fieldErrors) {
      return state.fieldErrors[field]?.[0];
    }
    return undefined;
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
          <div className="space-y-2 md:col-span-2">
            <Label>Macrociclo *</Label>
            <Select
              value={selectedMacrociclo}
              onValueChange={setSelectedMacrociclo}
            >
              <SelectTrigger className={getFieldError('macrocicloId') ? 'border-destructive' : ''}>
                <SelectValue placeholder="Selecciona un macrociclo" />
              </SelectTrigger>
              <SelectContent>
                {macrociclos.map((macro) => (
                  <SelectItem key={macro.id} value={macro.id}>
                    {macro.nombre} ({macro.temporada})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="macrocicloId" value={selectedMacrociclo} />
            {getFieldError('macrocicloId') && (
              <p className="text-sm text-destructive">{getFieldError('macrocicloId')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              type="text"
              id="nombre"
              name="nombre"
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
              placeholder="1"
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
            <Label htmlFor="fechaInicio">Fecha Inicio *</Label>
            <Input
              type="date"
              id="fechaInicio"
              name="fechaInicio"
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
              placeholder="Desarrollo de la resistencia aerobica..."
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
              placeholder="Perfeccionar las tecnicas de proyeccion..."
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
              placeholder="Desarrollar estrategias de combate..."
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
        <SubmitButton pendingText="Creando...">
          <Layers className="mr-2 h-4 w-4" />
          Crear Mesociclo
        </SubmitButton>
      </div>
    </form>
  );
}
