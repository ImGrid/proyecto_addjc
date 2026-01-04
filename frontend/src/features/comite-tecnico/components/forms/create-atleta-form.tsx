'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SubmitButton } from './submit-button';
import { createAtleta } from '../../actions/atleta.actions';
import { initialActionState } from '@/types/action-result';
import { User, MapPin, Scale, UserCog, UserPlus } from 'lucide-react';
import { CategoriaPesoValues } from '@/types/enums';
import { COMITE_TECNICO_ROUTES } from '@/lib/routes';

interface Entrenador {
  id: string;
  nombreCompleto: string;
}

interface CreateAtletaFormProps {
  entrenadores: Entrenador[];
}

// Formulario para crear un atleta
export function CreateAtletaForm({ entrenadores }: CreateAtletaFormProps) {
  const router = useRouter();
  const hasShownToast = useRef(false);
  const [state, formAction] = useActionState(createAtleta, initialActionState);

  // Mostrar toast y redirigir en caso de exito
  useEffect(() => {
    if (state.success && state.message && !hasShownToast.current) {
      hasShownToast.current = true;
      toast.success('Atleta creado', {
        description: state.message,
      });
      router.push(COMITE_TECNICO_ROUTES.atletas.list);
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

  return (
    <form action={formAction} className="space-y-6">
      {/* Seccion: Datos de Usuario */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Datos de Usuario
          </CardTitle>
          <CardDescription>Informacion de acceso al sistema</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="ci">CI (Carnet de Identidad) *</Label>
            <Input
              type="text"
              id="ci"
              name="ci"
              placeholder="Ej: 12345678"
              defaultValue={getPreviousValue('ci')}
              className={getFieldError('ci') ? 'border-destructive' : ''}
            />
            {getFieldError('ci') && (
              <p className="text-sm text-destructive">{getFieldError('ci')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nombreCompleto">Nombre Completo *</Label>
            <Input
              type="text"
              id="nombreCompleto"
              name="nombreCompleto"
              placeholder="Ej: Juan Perez Garcia"
              defaultValue={getPreviousValue('nombreCompleto')}
              className={getFieldError('nombreCompleto') ? 'border-destructive' : ''}
            />
            {getFieldError('nombreCompleto') && (
              <p className="text-sm text-destructive">{getFieldError('nombreCompleto')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              type="email"
              id="email"
              name="email"
              placeholder="Ej: juan.perez@email.com"
              defaultValue={getPreviousValue('email')}
              className={getFieldError('email') ? 'border-destructive' : ''}
            />
            {getFieldError('email') && (
              <p className="text-sm text-destructive">{getFieldError('email')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contrasena">Contrasena *</Label>
            <Input
              type="password"
              id="contrasena"
              name="contrasena"
              placeholder="Minimo 8 caracteres"
              defaultValue={getPreviousValue('contrasena')}
              className={getFieldError('contrasena') ? 'border-destructive' : ''}
            />
            {getFieldError('contrasena') && (
              <p className="text-sm text-destructive">{getFieldError('contrasena')}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Seccion: Datos Personales */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Datos Personales
          </CardTitle>
          <CardDescription>Informacion personal del atleta</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fechaNacimiento">Fecha de Nacimiento *</Label>
            <Input
              type="date"
              id="fechaNacimiento"
              name="fechaNacimiento"
              defaultValue={getPreviousValue('fechaNacimiento')}
              className={getFieldError('fechaNacimiento') ? 'border-destructive' : ''}
            />
            {getFieldError('fechaNacimiento') && (
              <p className="text-sm text-destructive">{getFieldError('fechaNacimiento')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edad">Edad *</Label>
            <Input
              type="number"
              id="edad"
              name="edad"
              placeholder="Ej: 18"
              min={5}
              defaultValue={getPreviousValue('edad')}
              className={getFieldError('edad') ? 'border-destructive' : ''}
            />
            {getFieldError('edad') && (
              <p className="text-sm text-destructive">{getFieldError('edad')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="municipio">Municipio *</Label>
            <Input
              type="text"
              id="municipio"
              name="municipio"
              placeholder="Ej: Cochabamba"
              defaultValue={getPreviousValue('municipio')}
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
              placeholder="Ej: 70012345"
              defaultValue={getPreviousValue('telefono')}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="direccion">Direccion</Label>
            <Input
              type="text"
              id="direccion"
              name="direccion"
              placeholder="Ej: Av. America 123"
              defaultValue={getPreviousValue('direccion')}
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
            <Label htmlFor="club">Club *</Label>
            <Input
              type="text"
              id="club"
              name="club"
              placeholder="Ej: Club ADDJC"
              defaultValue={getPreviousValue('club')}
              className={getFieldError('club') ? 'border-destructive' : ''}
            />
            {getFieldError('club') && (
              <p className="text-sm text-destructive">{getFieldError('club')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria">Categoria *</Label>
            <Input
              type="text"
              id="categoria"
              name="categoria"
              placeholder="Ej: Senior, Juvenil, Cadete"
              defaultValue={getPreviousValue('categoria')}
              className={getFieldError('categoria') ? 'border-destructive' : ''}
            />
            {getFieldError('categoria') && (
              <p className="text-sm text-destructive">{getFieldError('categoria')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoriaPeso">Categoria de Peso *</Label>
            <Select name="categoriaPeso" defaultValue={getPreviousValue('categoriaPeso') || undefined}>
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
              placeholder="Ej: 72.5"
              step="0.1"
              defaultValue={getPreviousValue('pesoActual')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fcReposo">FC Reposo (bpm)</Label>
            <Input
              type="number"
              id="fcReposo"
              name="fcReposo"
              placeholder="Ej: 60"
              defaultValue={getPreviousValue('fcReposo')}
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
          <CardDescription>Asigna un entrenador al atleta (opcional)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="entrenadorAsignadoId">Entrenador</Label>
            <Select name="entrenadorAsignadoId" defaultValue={getPreviousValue('entrenadorAsignadoId') || undefined}>
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
        <SubmitButton pendingText="Creando...">
          <UserPlus className="mr-2 h-4 w-4" />
          Crear Atleta
        </SubmitButton>
      </div>
    </form>
  );
}
