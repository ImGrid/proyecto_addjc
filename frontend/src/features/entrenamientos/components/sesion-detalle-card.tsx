import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sesion } from '../types/planificacion.types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface SesionDetalleCardProps {
  sesion: Sesion;
}

export function SesionDetalleCard({ sesion }: SesionDetalleCardProps) {
  const fecha = new Date(sesion.fecha);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Sesion {sesion.numeroSesion}</CardTitle>
              <p className="text-muted-foreground mt-1">
                {sesion.diaSemana} - {format(fecha, 'dd MMMM yyyy', { locale: es })}
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">{sesion.tipoSesion}</Badge>
              <Badge variant="secondary">{sesion.turno}</Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Planificacion vs Real */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cargas de Entrenamiento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {/* Duracion */}
            <div>
              <p className="text-xs text-muted-foreground mb-1">Duracion</p>
              <p className="text-lg font-semibold">{sesion.duracionPlanificada} min</p>
              {sesion.duracionReal && (
                <p className="text-xs text-muted-foreground">Real: {sesion.duracionReal} min</p>
              )}
            </div>

            {/* Volumen */}
            <div>
              <p className="text-xs text-muted-foreground mb-1">Volumen</p>
              <p className="text-lg font-semibold">{sesion.volumenPlanificado}</p>
              {sesion.volumenReal && (
                <p className="text-xs text-muted-foreground">Real: {sesion.volumenReal}</p>
              )}
            </div>

            {/* Intensidad */}
            <div>
              <p className="text-xs text-muted-foreground mb-1">Intensidad</p>
              <p className="text-lg font-semibold">{sesion.intensidadPlanificada}%</p>
              {sesion.intensidadReal && (
                <p className="text-xs text-muted-foreground">Real: {sesion.intensidadReal}%</p>
              )}
            </div>
          </div>

          {/* Datos adicionales */}
          <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-xs text-muted-foreground">Relacion V/I</p>
              <p className="text-sm font-medium">{sesion.relacionVI}</p>
            </div>
            {sesion.fcObjetivo && (
              <div>
                <p className="text-xs text-muted-foreground">FC Objetivo</p>
                <p className="text-sm font-medium">{sesion.fcObjetivo} bpm</p>
              </div>
            )}
            {sesion.zonaEsfuerzo && (
              <div>
                <p className="text-xs text-muted-foreground">Zona de Esfuerzo</p>
                <p className="text-sm font-medium">{sesion.zonaEsfuerzo}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contenidos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contenidos de la Sesion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Contenido Fisico */}
          <div>
            <h4 className="text-sm font-medium mb-2">Contenido Fisico</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {sesion.contenidoFisico}
            </p>
          </div>

          {/* Contenido Tecnico */}
          <div>
            <h4 className="text-sm font-medium mb-2">Contenido Tecnico</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {sesion.contenidoTecnico}
            </p>
          </div>

          {/* Contenido Tactico */}
          <div>
            <h4 className="text-sm font-medium mb-2">Contenido Tactico</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {sesion.contenidoTactico}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Estructura de la Sesion */}
      {(sesion.calentamiento || sesion.partePrincipal || sesion.vueltaCalma) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Estructura de la Sesion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sesion.calentamiento && (
              <div>
                <h4 className="text-sm font-medium mb-2">Calentamiento</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {sesion.calentamiento}
                </p>
              </div>
            )}

            {sesion.partePrincipal && (
              <div>
                <h4 className="text-sm font-medium mb-2">Parte Principal</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {sesion.partePrincipal}
                </p>
              </div>
            )}

            {sesion.vueltaCalma && (
              <div>
                <h4 className="text-sm font-medium mb-2">Vuelta a la Calma</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {sesion.vueltaCalma}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Material y Observaciones */}
      {(sesion.materialNecesario || sesion.observaciones) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informacion Adicional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sesion.materialNecesario && (
              <div>
                <h4 className="text-sm font-medium mb-2">Material Necesario</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {sesion.materialNecesario}
                </p>
              </div>
            )}

            {sesion.observaciones && (
              <div>
                <h4 className="text-sm font-medium mb-2">Observaciones</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {sesion.observaciones}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Informacion del Microciclo */}
      {sesion.microciclo && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contexto</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Esta sesion pertenece al Microciclo {sesion.microciclo.numeroGlobalMicrociclo}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {format(new Date(sesion.microciclo.fechaInicio), 'dd MMM', { locale: es })} - {format(new Date(sesion.microciclo.fechaFin), 'dd MMM yyyy', { locale: es })}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
