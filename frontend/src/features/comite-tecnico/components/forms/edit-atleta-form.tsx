'use client';

import { useActionState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SubmitButton } from './submit-button';
import { updateAtleta } from '../../actions/atleta.actions';
import { initialActionState } from '@/types/action-result';
import { AlertCircle, CheckCircle, MapPin, Scale, UserCog, Save } from 'lucide-react';
import { CategoriaPesoValues } from '@/types/enums';
import type { AtletaDetalle } from '@/features/entrenador/types/entrenador.types';

interface Entrenador {
  id: string;
  nombreCompleto: string;
}

interface EditAtletaFormProps {
  atleta: AtletaDetalle;
  entrenadores: Entrenador[];
}

// Formulario para editar un atleta existente
export function EditAtletaForm({ atleta, entrenadores }: EditAtletaFormProps) {
  // Bind del action con el ID del atleta
  const updateWithId = updateAtleta.bind(null, atleta.id);
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

      {/* Seccion: Datos Personales */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Datos Personales
          </CardTitle>
          <CardDescription>Informacion personal del atleta (datos de usuario no editables)</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
            <Input
              type="date"
              id="fechaNacimiento"
              name="fechaNacimiento"
              defaultValue={formatDateForInput(atleta.fechaNacimiento)}
              className={getFieldError('fechaNacimiento') ? 'border-destructive' : ''}
            />
            {getFieldError('fechaNacimiento') && (
              <p className="text-sm text-destructive">{getFieldError('fechaNacimiento')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edad">Edad</Label>
            <Input
              type="number"
              id="edad"
              name="edad"
              defaultValue={atleta.edad}
              min={5}
              className={getFieldError('edad') ? 'border-destructive' : ''}
            />
            {getFieldError('edad') && (
              <p className="text-sm text-destructive">{getFieldError('edad')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="municipio">Municipio</Label>
            <Input
              type="text"
              id="municipio"
              name="municipio"
              defaultValue={atleta.municipio}
              className={getFieldError('municipio') ? 'border-destructive' : ''}
            />
            {getFieldError('municipio') && (
              <p className="text-sm text-destructive">{getFieldError('municipio')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono">Telefono</Label>
            <Input
              type="tel"
              id="telefono"
              name="telefono"
              defaultValue={atleta.telefono || ''}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="direccion">Direccion</Label>
            <Input
              type="text"
              id="direccion"
              name="direccion"
              defaultValue={atleta.direccion || ''}
            />
          </div>
        </CardContent>
      </Card>

      {/* Seccion: Datos Deportivos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Datos Deportivos
          </CardTitle>
          <CardDescription>Informacion deportiva del atleta</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="club">Club</Label>
            <Input
              type="text"
              id="club"
              name="club"
              defaultValue={atleta.club}
              className={getFieldError('club') ? 'border-destructive' : ''}
            />
            {getFieldError('club') && (
              <p className="text-sm text-destructive">{getFieldError('club')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria">Categoria</Label>
            <Input
              type="text"
              id="categoria"
              name="categoria"
              defaultValue={atleta.categoria}
              className={getFieldError('categoria') ? 'border-destructive' : ''}
            />
            {getFieldError('categoria') && (
              <p className="text-sm text-destructive">{getFieldError('categoria')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="peso">Peso (categoria)</Label>
            <Input
              type="text"
              id="peso"
              name="peso"
              defaultValue={atleta.peso}
              className={getFieldError('peso') ? 'border-destructive' : ''}
            />
            {getFieldError('peso') && (
              <p className="text-sm text-destructive">{getFieldError('peso')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoriaPeso">Categoria de Peso</Label>
            <Select name="categoriaPeso" defaultValue={atleta.categoriaPeso || undefined}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona categoria" />
              </SelectTrigger>
              <SelectContent>
                {CategoriaPesoValues.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pesoActual">Peso Actual (kg)</Label>
            <Input
              type="number"
              id="pesoActual"
              name="pesoActual"
              defaultValue={atleta.pesoActual || ''}
              step="0.1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fcReposo">FC Reposo (bpm)</Label>
            <Input
              type="number"
              id="fcReposo"
              name="fcReposo"
              defaultValue={atleta.fcReposo || ''}
            />
          </div>
        </CardContent>
      </Card>

      {/* Seccion: Entrenador */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Asignacion de Entrenador
          </CardTitle>
          <CardDescription>Cambia el entrenador asignado al atleta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="entrenadorAsignadoId">Entrenador</Label>
            <Select
              name="entrenadorAsignadoId"
              defaultValue={atleta.entrenadorAsignado?.id || undefined}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un entrenador" />
              </SelectTrigger>
              <SelectContent>
                {entrenadores.map((ent) => (
                  <SelectItem key={ent.id} value={ent.id}>
                    {ent.nombreCompleto}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
