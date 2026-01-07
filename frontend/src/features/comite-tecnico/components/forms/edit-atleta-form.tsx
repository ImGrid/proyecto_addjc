'use client';

import { useActionState, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { SubmitButton } from './submit-button';
import { updateAtleta } from '../../actions/atleta.actions';
import { initialActionState } from '@/types/action-result';
import { MapPin, Scale, UserCog, Save, UserCheck } from 'lucide-react';
import { CategoriaPesoValues } from '@/types/enums';
import type { AtletaDetalle } from '@/features/entrenador/types/entrenador.types';
import { formatDateForInput } from '@/lib/date-utils';

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
  const router = useRouter();
  const hasShownToast = useRef(false);

  // Bind del action con el ID del atleta
  const updateWithId = updateAtleta.bind(null, atleta.id);
  const [state, formAction] = useActionState(updateWithId, initialActionState);
  const [selectedCategoriaPeso, setSelectedCategoriaPeso] = useState(atleta.categoriaPeso || '');
  const [selectedEntrenador, setSelectedEntrenador] = useState(atleta.entrenadorAsignado?.id || '');
  const [estadoActivo, setEstadoActivo] = useState(atleta.usuario.estado);

  // Mostrar toast y redirigir en caso de exito
  useEffect(() => {
    if (state.success && state.message && !hasShownToast.current) {
      hasShownToast.current = true;
      toast.success('Atleta actualizado', {
        description: state.message,
      });
      router.back();
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
  const getPreviousValue = (field: string, originalValue: string): string => {
    if (!state.success && state.submittedData) {
      const value = state.submittedData[field];
      return value !== undefined && value !== null ? String(value) : originalValue;
    }
    return originalValue;
  };

  // Restaurar valores de selects controlados si hay error
  useEffect(() => {
    if (!state.success && state.submittedData) {
      if (state.submittedData.categoriaPeso) {
        setSelectedCategoriaPeso(String(state.submittedData.categoriaPeso));
      }
      if (state.submittedData.entrenadorAsignadoId) {
        setSelectedEntrenador(String(state.submittedData.entrenadorAsignadoId));
      }
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
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
              defaultValue={getPreviousValue('fechaNacimiento', formatDateForInput(atleta.fechaNacimiento))}
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
              defaultValue={getPreviousValue('edad', String(atleta.edad))}
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
              defaultValue={getPreviousValue('municipio', atleta.municipio)}
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
              defaultValue={getPreviousValue('telefono', atleta.telefono || '')}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="direccion">Direccion</Label>
            <Input
              type="text"
              id="direccion"
              name="direccion"
              defaultValue={getPreviousValue('direccion', atleta.direccion || '')}
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
              defaultValue={getPreviousValue('club', atleta.club)}
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
              defaultValue={getPreviousValue('categoria', atleta.categoria)}
              className={getFieldError('categoria') ? 'border-destructive' : ''}
            />
            {getFieldError('categoria') && (
              <p className="text-sm text-destructive">{getFieldError('categoria')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoriaPeso">Categoria de Peso *</Label>
            <Select value={selectedCategoriaPeso} onValueChange={setSelectedCategoriaPeso}>
              <SelectTrigger className={getFieldError('categoriaPeso') ? 'border-destructive' : ''}>
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
            <input type="hidden" name="categoriaPeso" value={selectedCategoriaPeso} />
            {getFieldError('categoriaPeso') && (
              <p className="text-sm text-destructive">{getFieldError('categoriaPeso')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pesoActual">Peso Actual (kg)</Label>
            <Input
              type="number"
              id="pesoActual"
              name="pesoActual"
              defaultValue={getPreviousValue('pesoActual', atleta.pesoActual ? String(atleta.pesoActual) : '')}
              step="0.1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fcReposo">FC Reposo (bpm)</Label>
            <Input
              type="number"
              id="fcReposo"
              name="fcReposo"
              defaultValue={getPreviousValue('fcReposo', atleta.fcReposo ? String(atleta.fcReposo) : '')}
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
              value={selectedEntrenador}
              onValueChange={setSelectedEntrenador}
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
            <input type="hidden" name="entrenadorAsignadoId" value={selectedEntrenador} />
          </div>
        </CardContent>
      </Card>

      {/* Seccion: Estado del Atleta */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Estado del Atleta
          </CardTitle>
          <CardDescription>
            Activa o desactiva el atleta en el sistema. Un atleta desactivado no podra acceder al sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="estado">Atleta Activo</Label>
              <p className="text-sm text-muted-foreground">
                {estadoActivo ? 'El atleta puede acceder al sistema' : 'El atleta no puede acceder al sistema'}
              </p>
            </div>
            <Switch
              id="estado"
              checked={estadoActivo}
              onCheckedChange={setEstadoActivo}
            />
          </div>
          <input type="hidden" name="estado" value={String(estadoActivo)} />
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
