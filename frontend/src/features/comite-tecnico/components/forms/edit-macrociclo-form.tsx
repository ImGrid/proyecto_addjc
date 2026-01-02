'use client';

import { useActionState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SubmitButton } from './submit-button';
import { updateMacrociclo } from '../../actions/macrociclo.actions';
import { initialActionState } from '@/types/action-result';
import { AlertCircle, Calendar, Target, CheckCircle, Save } from 'lucide-react';
import { EstadoMacrocicloValues } from '@/types/enums';
import type { Macrociclo } from '../../types/planificacion.types';

interface EditMacrocicloFormProps {
  macrociclo: Macrociclo;
}

// Formulario para editar un macrociclo existente
export function EditMacrocicloForm({ macrociclo }: EditMacrocicloFormProps) {
  // Bind del action con el ID del macrociclo
  const updateWithId = updateMacrociclo.bind(null, macrociclo.id);
  const [state, formAction] = useActionState(updateWithId, initialActionState);

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
            <Calendar className="h-5 w-5" />
            Datos Generales
          </CardTitle>
          <CardDescription>Informacion basica del macrociclo</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              type="text"
              id="nombre"
              name="nombre"
              defaultValue={macrociclo.nombre}
              placeholder="Ej: Macrociclo 2026"
              className={getFieldError('nombre') ? 'border-destructive' : ''}
            />
            {getFieldError('nombre') && (
              <p className="text-sm text-destructive">{getFieldError('nombre')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="temporada">Temporada *</Label>
            <Input
              type="text"
              id="temporada"
              name="temporada"
              defaultValue={macrociclo.temporada}
              placeholder="Ej: 2026"
              className={getFieldError('temporada') ? 'border-destructive' : ''}
            />
            {getFieldError('temporada') && (
              <p className="text-sm text-destructive">{getFieldError('temporada')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="equipo">Equipo *</Label>
            <Input
              type="text"
              id="equipo"
              name="equipo"
              defaultValue={macrociclo.equipo}
              placeholder="Ej: Seleccion Cochabamba"
              className={getFieldError('equipo') ? 'border-destructive' : ''}
            />
            {getFieldError('equipo') && (
              <p className="text-sm text-destructive">{getFieldError('equipo')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoriaObjetivo">Categoria Objetivo *</Label>
            <Input
              type="text"
              id="categoriaObjetivo"
              name="categoriaObjetivo"
              defaultValue={macrociclo.categoriaObjetivo}
              placeholder="Ej: Senior"
              className={getFieldError('categoriaObjetivo') ? 'border-destructive' : ''}
            />
            {getFieldError('categoriaObjetivo') && (
              <p className="text-sm text-destructive">{getFieldError('categoriaObjetivo')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaInicio">Fecha Inicio *</Label>
            <Input
              type="date"
              id="fechaInicio"
              name="fechaInicio"
              defaultValue={formatDateForInput(macrociclo.fechaInicio)}
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
              defaultValue={formatDateForInput(macrociclo.fechaFin)}
              className={getFieldError('fechaFin') ? 'border-destructive' : ''}
            />
            {getFieldError('fechaFin') && (
              <p className="text-sm text-destructive">{getFieldError('fechaFin')}</p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="estado">Estado</Label>
            <Select name="estado" defaultValue={macrociclo.estado}>
              <SelectTrigger className={getFieldError('estado') ? 'border-destructive' : ''}>
                <SelectValue placeholder="Selecciona un estado" />
              </SelectTrigger>
              <SelectContent>
                {EstadoMacrocicloValues.map((estado) => (
                  <SelectItem key={estado} value={estado}>
                    {estado.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {getFieldError('estado') && (
              <p className="text-sm text-destructive">{getFieldError('estado')}</p>
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
          <CardDescription>Define los objetivos principales del macrociclo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="objetivo1">Objetivo 1 *</Label>
            <Textarea
              id="objetivo1"
              name="objetivo1"
              defaultValue={macrociclo.objetivo1}
              placeholder="Objetivo principal del macrociclo"
              rows={2}
              className={getFieldError('objetivo1') ? 'border-destructive' : ''}
            />
            {getFieldError('objetivo1') && (
              <p className="text-sm text-destructive">{getFieldError('objetivo1')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="objetivo2">Objetivo 2 *</Label>
            <Textarea
              id="objetivo2"
              name="objetivo2"
              defaultValue={macrociclo.objetivo2}
              placeholder="Segundo objetivo del macrociclo"
              rows={2}
              className={getFieldError('objetivo2') ? 'border-destructive' : ''}
            />
            {getFieldError('objetivo2') && (
              <p className="text-sm text-destructive">{getFieldError('objetivo2')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="objetivo3">Objetivo 3 *</Label>
            <Textarea
              id="objetivo3"
              name="objetivo3"
              defaultValue={macrociclo.objetivo3}
              placeholder="Tercer objetivo del macrociclo"
              rows={2}
              className={getFieldError('objetivo3') ? 'border-destructive' : ''}
            />
            {getFieldError('objetivo3') && (
              <p className="text-sm text-destructive">{getFieldError('objetivo3')}</p>
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
