'use client';

import { useActionState, useState, useEffect, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { SelectAtleta } from './select-atleta';
import { SelectSesion } from './select-sesion';
import { DolenciasFieldArray, FormWithDolencias } from './dolencias-field-array';
import { SubmitButton } from './submit-button';
import { createRegistro } from '../../actions/create-registro';
import { initialActionState } from '@/types/action-result';
import { fetchSesionesByAtleta, SesionParaSelector } from '../../actions/fetch-sesiones';
import {
  Activity,
  Moon,
  Smile,
  FileText,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { ENTRENADOR_ROUTES } from '@/lib/routes';

interface Atleta {
  id: string;
  nombreCompleto: string;
}

interface CreateRegistroFormProps {
  atletas: Atleta[];
}

// Tipos de sesion permitidos para registro post-entrenamiento
const TIPOS_SESION_PERMITIDOS = 'ENTRENAMIENTO,RECUPERACION,COMPETENCIA';

export function CreateRegistroForm({ atletas }: CreateRegistroFormProps) {
  const router = useRouter();
  const hasShownToast = useRef(false);
  const [state, formAction] = useActionState(createRegistro, initialActionState);
  const [selectedAtleta, setSelectedAtleta] = useState('');
  const [selectedSesion, setSelectedSesion] = useState('');
  const [sesiones, setSesiones] = useState<SesionParaSelector[]>([]);
  const [isPending, startTransition] = useTransition();
  const [asistio, setAsistio] = useState(true);

  // Detectar si la sesion seleccionada es tipo COMPETENCIA
  const sesionSeleccionada = sesiones.find(s => s.id === selectedSesion);
  const esCompetencia = sesionSeleccionada?.tipoSesion === 'COMPETENCIA';

  // React Hook Form para manejo del array de dolencias (sin resolver - validacion en servidor)
  const { control, register, getValues } = useForm<FormWithDolencias>({
    defaultValues: {
      dolencias: [],
    },
  });

  // Cargar sesiones cuando cambia el atleta seleccionado
  // Solo tipos ENTRENAMIENTO, RECUPERACION, COMPETENCIA
  useEffect(() => {
    if (selectedAtleta) {
      // Limpiar sesion seleccionada al cambiar de atleta
      setSelectedSesion('');
      setSesiones([]);

      // Cargar sesiones del atleta (solo tipos permitidos para post-entrenamiento)
      startTransition(async () => {
        const data = await fetchSesionesByAtleta(selectedAtleta, TIPOS_SESION_PERMITIDOS);
        if (data) {
          setSesiones(data);
        }
      });
    } else {
      setSesiones([]);
      setSelectedSesion('');
    }
  }, [selectedAtleta]);

  // Mostrar toast y redirigir en caso de exito
  useEffect(() => {
    if (state.success && state.message && !hasShownToast.current) {
      hasShownToast.current = true;
      toast.success('Registro guardado', {
        description: state.message,
      });
      router.push(ENTRENADOR_ROUTES.postEntrenamiento.list);
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

  // Obtener error de un campo especifico (del servidor)
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

  // Restaurar valores de selects controlados si hay error
  useEffect(() => {
    if (!state.success && state.submittedData) {
      if (state.submittedData.atletaId) {
        setSelectedAtleta(String(state.submittedData.atletaId));
      }
      if (state.submittedData.sesionId) {
        setSelectedSesion(String(state.submittedData.sesionId));
      }
      if (state.submittedData.asistio !== undefined) {
        setAsistio(state.submittedData.asistio === true || state.submittedData.asistio === 'true');
      }
    }
  }, [state]);

  // Manejar submit del formulario
  const handleFormAction = async (formData: FormData) => {
    // Agregar valores de los selects controlados
    formData.set('atletaId', selectedAtleta);
    formData.set('sesionId', selectedSesion);
    formData.set('asistio', asistio.toString());

    // Obtener dolencias del formulario de React Hook Form
    const dolencias = getValues('dolencias');
    if (dolencias && dolencias.length > 0) {
      formData.set('dolencias', JSON.stringify(dolencias));
    }

    // Llamar al server action
    return formAction(formData);
  };

  return (
    <form action={handleFormAction} className="space-y-6">
      {/* Seccion: Atleta y Sesion */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Datos de la Sesion</CardTitle>
          <CardDescription>Selecciona el atleta y la sesion a registrar</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <SelectAtleta
            atletas={atletas}
            value={selectedAtleta}
            onValueChange={setSelectedAtleta}
            error={getFieldError('atletaId')}
          />

          <SelectSesion
            sesiones={sesiones}
            value={selectedSesion}
            onValueChange={setSelectedSesion}
            error={getFieldError('sesionId')}
            disabled={!selectedAtleta || isPending}
          />

          {isPending && (
            <p className="text-sm text-muted-foreground col-span-2">
              Cargando sesiones del atleta...
            </p>
          )}

          {!isPending && selectedAtleta && sesiones.length === 0 && (
            <p className="text-sm text-amber-600 col-span-2">
              Este atleta no tiene sesiones de entrenamiento, recuperacion o competencia asignadas.
            </p>
          )}

          {/* Indicador de tipo de sesion seleccionada */}
          {selectedSesion && sesionSeleccionada && (
            <p className="text-sm text-muted-foreground col-span-2">
              Tipo de sesion: <span className="font-medium">{sesionSeleccionada.tipoSesion.replace(/_/g, ' ')}</span>
              {esCompetencia && (
                <span className="ml-2 text-blue-600">(Formulario simplificado)</span>
              )}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Seccion: Asistencia */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            {asistio ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            Asistencia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="asistio">El atleta asistio a la sesion</Label>
              <p className="text-sm text-muted-foreground">
                {asistio ? 'El atleta estuvo presente' : 'El atleta no asistio'}
              </p>
            </div>
            <Switch
              id="asistio"
              checked={asistio}
              onCheckedChange={setAsistio}
            />
          </div>

          {/* Motivo de inasistencia (condicional) */}
          {!asistio && (
            <div className="space-y-2">
              <Label htmlFor="motivoInasistencia">Motivo de Inasistencia *</Label>
              <textarea
                id="motivoInasistencia"
                name="motivoInasistencia"
                rows={2}
                maxLength={500}
                placeholder="Explica el motivo de la inasistencia..."
                required={!asistio}
                defaultValue={getPreviousValue('motivoInasistencia')}
                className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
              {getFieldError('motivoInasistencia') && (
                <p className="text-sm text-destructive">{getFieldError('motivoInasistencia')}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Solo mostrar secciones de ejecucion si asistio Y NO es COMPETENCIA */}
      {asistio && !esCompetencia && (
        <>
          {/* Seccion: Ejecucion */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Ejecucion de la Sesion
              </CardTitle>
              <CardDescription>Datos sobre la ejecucion del entrenamiento</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="ejerciciosCompletados">Ejercicios Completados (%)</Label>
                <Input
                  type="number"
                  id="ejerciciosCompletados"
                  name="ejerciciosCompletados"
                  defaultValue={getPreviousValue('ejerciciosCompletados') || 100}
                  min={0}
                  max={100}
                  className={getFieldError('ejerciciosCompletados') ? 'border-destructive' : ''}
                />
                {getFieldError('ejerciciosCompletados') && (
                  <p className="text-sm text-destructive">{getFieldError('ejerciciosCompletados')}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="intensidadAlcanzada">Intensidad Alcanzada (%)</Label>
                <Input
                  type="number"
                  id="intensidadAlcanzada"
                  name="intensidadAlcanzada"
                  defaultValue={getPreviousValue('intensidadAlcanzada') || 100}
                  min={0}
                  max={100}
                  className={getFieldError('intensidadAlcanzada') ? 'border-destructive' : ''}
                />
                {getFieldError('intensidadAlcanzada') && (
                  <p className="text-sm text-destructive">{getFieldError('intensidadAlcanzada')}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="duracionReal">Duracion Real (min)</Label>
                <Input
                  type="number"
                  id="duracionReal"
                  name="duracionReal"
                  defaultValue={getPreviousValue('duracionReal') || 90}
                  min={1}
                  max={480}
                  className={getFieldError('duracionReal') ? 'border-destructive' : ''}
                />
                {getFieldError('duracionReal') && (
                  <p className="text-sm text-destructive">{getFieldError('duracionReal')}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Seccion: Estado Fisico */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Percepcion de Esfuerzo (RPE)
              </CardTitle>
              <CardDescription>Indica el nivel de esfuerzo percibido</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="rpe">RPE (1-10) *</Label>
                <Input
                  type="number"
                  id="rpe"
                  name="rpe"
                  defaultValue={getPreviousValue('rpe') || 5}
                  min={1}
                  max={10}
                  className={getFieldError('rpe') ? 'border-destructive' : ''}
                />
                <p className="text-xs text-muted-foreground">
                  1 = Muy facil, 5 = Moderado, 10 = Esfuerzo maximo
                </p>
                {getFieldError('rpe') && (
                  <p className="text-sm text-destructive">{getFieldError('rpe')}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Seccion: Estado de Recuperacion */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Moon className="h-5 w-5" />
                Estado de Recuperacion
              </CardTitle>
              <CardDescription>Datos sobre sueno y descanso</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="calidadSueno">Calidad de Sueno (1-10) *</Label>
                <Input
                  type="number"
                  id="calidadSueno"
                  name="calidadSueno"
                  defaultValue={getPreviousValue('calidadSueno') || 7}
                  min={1}
                  max={10}
                  className={getFieldError('calidadSueno') ? 'border-destructive' : ''}
                />
                <p className="text-xs text-muted-foreground">
                  1 = Muy mala, 10 = Excelente
                </p>
                {getFieldError('calidadSueno') && (
                  <p className="text-sm text-destructive">{getFieldError('calidadSueno')}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="horasSueno">Horas de Sueno</Label>
                <Input
                  type="number"
                  id="horasSueno"
                  name="horasSueno"
                  placeholder="7.5"
                  min={0}
                  max={24}
                  step={0.5}
                  defaultValue={getPreviousValue('horasSueno')}
                  className={getFieldError('horasSueno') ? 'border-destructive' : ''}
                />
                {getFieldError('horasSueno') && (
                  <p className="text-sm text-destructive">{getFieldError('horasSueno')}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="estadoAnimico" className="flex items-center gap-2">
                  <Smile className="h-4 w-4" />
                  Estado Animico (1-10) *
                </Label>
                <Input
                  type="number"
                  id="estadoAnimico"
                  name="estadoAnimico"
                  defaultValue={getPreviousValue('estadoAnimico') || 7}
                  min={1}
                  max={10}
                  className={getFieldError('estadoAnimico') ? 'border-destructive' : ''}
                />
                <p className="text-xs text-muted-foreground">
                  1 = Muy mal, 10 = Excelente
                </p>
                {getFieldError('estadoAnimico') && (
                  <p className="text-sm text-destructive">{getFieldError('estadoAnimico')}</p>
                )}
              </div>
            </CardContent>
          </Card>

        </>
      )}

      {/* Seccion: Dolencias - se muestra siempre que asistio (incluido COMPETENCIA) */}
      {asistio && (
        <DolenciasFieldArray
          control={control}
          register={register}
        />
      )}

      {/* Seccion: Observaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Observaciones
          </CardTitle>
          <CardDescription>Notas adicionales sobre la sesion</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones Generales</Label>
            <textarea
              id="observaciones"
              name="observaciones"
              rows={3}
              maxLength={1000}
              placeholder="Notas sobre el desempeno, areas a mejorar, comentarios del atleta..."
              defaultValue={getPreviousValue('observaciones')}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </CardContent>
      </Card>

      {/* Boton Submit */}
      <div className="flex justify-end gap-4">
        <SubmitButton pendingText="Guardando registro...">
          Guardar Registro
        </SubmitButton>
      </div>
    </form>
  );
}
