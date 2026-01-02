'use client';

import { useActionState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SubmitButton } from './submit-button';
import { createAtleta } from '../../actions/atleta.actions';
import { initialActionState } from '@/types/action-result';
import { AlertCircle, User, MapPin, Scale, UserCog, UserPlus } from 'lucide-react';
import { CategoriaPesoValues } from '@/types/enums';

interface Entrenador {
  id: string;
  nombreCompleto: string;
}

interface CreateAtletaFormProps {
  entrenadores: Entrenador[];
}

// Formulario para crear un atleta
export function CreateAtletaForm({ entrenadores }: CreateAtletaFormProps) {
  const [state, formAction] = useActionState(createAtleta, initialActionState);

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
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="direccion">Direccion</Label>
            <Input
              type="text"
              id="direccion"
              name="direccion"
              placeholder="Ej: Av. America 123"
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
              className={getFieldError('categoria') ? 'border-destructive' : ''}
            />
            {getFieldError('categoria') && (
              <p className="text-sm text-destructive">{getFieldError('categoria')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="peso">Peso (categoria) *</Label>
            <Input
              type="text"
              id="peso"
              name="peso"
              placeholder="Ej: -73kg"
              className={getFieldError('peso') ? 'border-destructive' : ''}
            />
            {getFieldError('peso') && (
              <p className="text-sm text-destructive">{getFieldError('peso')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoriaPeso">Categoria de Peso</Label>
            <Select name="categoriaPeso">
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
              placeholder="Ej: 72.5"
              step="0.1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fcReposo">FC Reposo (bpm)</Label>
            <Input
              type="number"
              id="fcReposo"
              name="fcReposo"
              placeholder="Ej: 60"
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
            <Select name="entrenadorAsignadoId">
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
