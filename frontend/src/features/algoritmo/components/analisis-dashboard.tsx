'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TendenciaChart } from './tendencia-chart';
import type { AnalisisRendimiento } from '../types/algoritmo.types';

interface AnalisisDashboardProps {
  analisis: AnalisisRendimiento;
}

// Dashboard completo de analisis de rendimiento
export function AnalisisDashboard({ analisis }: AnalisisDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Resumen general */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rendimiento global
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {analisis.resumenGeneral.rendimientoGlobalPromedio.toFixed(1)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sesiones analizadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {analisis.resumenGeneral.totalSesiones}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Registros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {analisis.resumenGeneral.totalRegistros}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Requiere atencion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              variant={analisis.requiereAtencion ? 'destructive' : 'default'}
            >
              {analisis.requiereAtencion
                ? `SI - ${analisis.prioridadAtencion}`
                : 'No'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Periodo de analisis */}
      <p className="text-sm text-muted-foreground">
        Periodo: {new Date(analisis.periodoAnalisis.desde).toLocaleDateString('es-BO')}
        {' - '}
        {new Date(analisis.periodoAnalisis.hasta).toLocaleDateString('es-BO')}
        {' '}({analisis.periodoAnalisis.diasAnalizados} dias)
      </p>

      {/* Rendimiento por tipo de ejercicio */}
      <TendenciaChart rendimientoPorTipo={analisis.rendimientoPorTipo} />

      {/* Patrones detectados */}
      {analisis.patrones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Patrones detectados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analisis.patrones.map((patron, i) => (
                <div key={i} className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant={
                        patron.severidad === 'CRITICA' || patron.severidad === 'ALTA'
                          ? 'destructive'
                          : patron.severidad === 'MEDIA'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {patron.severidad}
                    </Badge>
                    <span className="text-sm font-medium">{patron.tipo}</span>
                  </div>
                  <p className="text-sm">{patron.descripcion}</p>
                  {patron.ejercicioAfectado && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Ejercicio: {patron.ejercicioAfectado.nombre}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recomendaciones del analisis */}
      {analisis.recomendaciones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Recomendaciones ({analisis.recomendaciones.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analisis.recomendaciones.map((rec, i) => (
                <div key={i} className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary">{rec.prioridad}</Badge>
                    <span className="text-sm font-medium">{rec.titulo}</span>
                  </div>
                  <p className="text-sm">{rec.mensaje}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Accion: {rec.accionSugerida}
                  </p>

                  {/* Cambios sugeridos */}
                  {rec.cambiosSugeridos && (
                    <div className="mt-2 text-xs">
                      {rec.cambiosSugeridos.reducir.length > 0 && (
                        <p className="text-destructive">
                          Reducir: {rec.cambiosSugeridos.reducir.map((c) => c.nombre).join(', ')}
                        </p>
                      )}
                      {rec.cambiosSugeridos.agregar.length > 0 && (
                        <p className="text-green-600">
                          Agregar: {rec.cambiosSugeridos.agregar.map((c) => c.nombre).join(', ')}
                        </p>
                      )}
                      {rec.cambiosSugeridos.modificar.length > 0 && (
                        <p className="text-yellow-600">
                          Modificar: {rec.cambiosSugeridos.modificar.map((c) => c.cambio).join(', ')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ejercicios problematicos globales */}
      {analisis.ejerciciosProblematicos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Ejercicios problematicos ({analisis.ejerciciosProblematicos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analisis.ejerciciosProblematicos.map((ej) => (
                <div key={ej.ejercicioId} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{ej.nombre}</span>
                    <Badge variant="outline">{ej.tipo}</Badge>
                  </div>
                  <div className="grid gap-2 grid-cols-2 md:grid-cols-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Rendimiento: </span>
                      <span className="font-mono">
                        {ej.rendimientoPromedio.toFixed(1)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Asignado: </span>
                      <span className="font-mono">{ej.vecesAsignado}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Completado: </span>
                      <span className="font-mono">{ej.vecesCompletado}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">No completado: </span>
                      <span className="font-mono">{ej.vecesNoCompletado}</span>
                    </div>
                  </div>
                  {ej.alternativasSugeridas.length > 0 && (
                    <div className="mt-2 text-xs">
                      <span className="text-muted-foreground">Alternativas: </span>
                      {ej.alternativasSugeridas.map((alt) => alt.nombre).join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
