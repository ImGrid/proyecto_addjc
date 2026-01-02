'use client';

import { useActionState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SubmitButton } from './submit-button';
import { createMacrociclo } from '../../actions/macrociclo.actions';
import { initialActionState } from '@/types/action-result';
import { AlertCircle, Calendar, Target, FileText } from 'lucide-react';
import { EstadoMacrocicloValues } from '@/types/enums';

// Formulario para crear un macrociclo
export function CreateMacrocicloForm() {
  const [state, formAction] = useActionState(createMacrociclo, initialActionState);

  // Obtener fecha actual en formato YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  // Obtener error de un campo especifico
  const getFieldError = (field: string): string | undefined => {
    if (!state.success && state.fieldErrors) {
      return state.fieldErrors[field]?.[0];
    }
    return undefined;
  };

  return (
    <form action={formAction} className="space-y-6">
      {/* Error general */}
      {!state.success && state.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {/* Seccion: Datos Generales */}
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
              placeholder="Ej: Macrociclo 2025"
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
              placeholder="Ej: 2025"
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
              placeholder="Ej: Senior"
              className={getFieldError('categoriaObjetivo') ? 'border-destructive' : ''}
            />
            {getFieldError('categoriaObjetivo') && (
              <p className="text-sm text-destructive">{getFieldError('categoriaObjetivo')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaInicio">Fecha de Inicio *</Label>
            <Input
              type="date"
              id="fechaInicio"
              name="fechaInicio"
              defaultValue={today}
              className={getFieldError('fechaInicio') ? 'border-destructive' : ''}
            />
            {getFieldError('fechaInicio') && (
              <p className="text-sm text-destructive">{getFieldError('fechaInicio')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaFin">Fecha de Fin *</Label>
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

          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <Select name="estado" defaultValue="PLANIFICADO">
              <SelectTrigger>
                <SelectValue placeholder="Selecciona estado" />
              </SelectTrigger>
              <SelectContent>
                {EstadoMacrocicloValues.map((estado) => (
                  <SelectItem key={estado} value={estado}>
                    {estado.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Seccion: Objetivos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Objetivos
          </CardTitle>
          <CardDescription>Define los tres objetivos principales del macrociclo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="objetivo1">Objetivo 1 *</Label>
            <Input
              type="text"
              id="objetivo1"
              name="objetivo1"
              placeholder="Ej: Mejorar resistencia aerobica"
              className={getFieldError('objetivo1') ? 'border-destructive' : ''}
            />
            {getFieldError('objetivo1') && (
              <p className="text-sm text-destructive">{getFieldError('objetivo1')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="objetivo2">Objetivo 2 *</Label>
            <Input
              type="text"
              id="objetivo2"
              name="objetivo2"
              placeholder="Ej: Desarrollar fuerza especifica"
              className={getFieldError('objetivo2') ? 'border-destructive' : ''}
            />
            {getFieldError('objetivo2') && (
              <p className="text-sm text-destructive">{getFieldError('objetivo2')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="objetivo3">Objetivo 3 *</Label>
            <Input
              type="text"
              id="objetivo3"
              name="objetivo3"
              placeholder="Ej: Perfeccionar tecnica competitiva"
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
        <SubmitButton pendingText="Creando...">
          <FileText className="mr-2 h-4 w-4" />
          Crear Macrociclo
        </SubmitButton>
      </div>
    </form>
  );
}
