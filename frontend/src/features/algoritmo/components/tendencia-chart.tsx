'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { RendimientoPorTipo } from '../types/algoritmo.types';

interface TendenciaChartProps {
  rendimientoPorTipo: RendimientoPorTipo[];
}

// Nombres legibles para tipos de ejercicio
const TIPO_LABELS: Record<string, string> = {
  FISICO: 'Fisico',
  TECNICO_TACHI: 'Tecnico Tachi-waza',
  TECNICO_NE: 'Tecnico Ne-waza',
  RESISTENCIA: 'Resistencia',
  VELOCIDAD: 'Velocidad',
};

function getTendenciaVariant(tendencia: string) {
  switch (tendencia) {
    case 'MEJORANDO':
      return 'default';
    case 'ESTABLE':
      return 'secondary';
    case 'EMPEORANDO':
      return 'destructive';
    default:
      return 'outline';
  }
}

function getInterpretacionVariant(interpretacion: string) {
  switch (interpretacion) {
    case 'CRITICO_BAJO':
    case 'CRITICO_ALTO':
      return 'destructive';
    case 'ALERTA_BAJA':
    case 'ALERTA_ALTA':
      return 'secondary';
    case 'NORMAL':
      return 'default';
    default:
      return 'outline';
  }
}

// Grafico de tendencias por tipo de ejercicio
// Muestra rendimiento promedio, z-score y tendencia para cada tipo
export function TendenciaChart({ rendimientoPorTipo }: TendenciaChartProps) {
  if (rendimientoPorTipo.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No hay datos de rendimiento por tipo de ejercicio.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rendimiento por tipo de ejercicio</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {rendimientoPorTipo.map((tipo) => (
            <div key={tipo.tipo} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">
                  {TIPO_LABELS[tipo.tipo] || tipo.tipo}
                </h4>
                <div className="flex gap-2">
                  <Badge variant={getTendenciaVariant(tipo.tendencia.tendencia)}>
                    {tipo.tendencia.tendencia}
                  </Badge>
                  <Badge
                    variant={getInterpretacionVariant(tipo.zScore.interpretacion)}
                  >
                    Z: {tipo.zScore.zScore.toFixed(2)}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-4 grid-cols-2 md:grid-cols-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Rendimiento promedio</p>
                  <p className="font-mono font-medium">
                    {tipo.rendimientoPromedio.toFixed(1)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Registros</p>
                  <p className="font-mono">{tipo.cantidadRegistros}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Pendiente</p>
                  <p className="font-mono">
                    {tipo.tendencia.pendiente.toFixed(3)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">R-Cuadrado</p>
                  <p className="font-mono">
                    {tipo.tendencia.rSquared.toFixed(3)}
                  </p>
                </div>
              </div>

              {tipo.ejerciciosProblematicos.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm font-medium text-destructive mb-1">
                    Ejercicios problematicos ({tipo.ejerciciosProblematicos.length})
                  </p>
                  <div className="space-y-2">
                    {tipo.ejerciciosProblematicos.map((ej) => (
                      <div key={ej.ejercicioId}>
                        <div className="text-sm flex items-center justify-between">
                          <span>{ej.nombre}</span>
                          <span className="text-muted-foreground">
                            Rendimiento: {ej.rendimientoPromedio.toFixed(1)} |
                            Completados: {ej.vecesCompletado}/{ej.vecesAsignado}
                          </span>
                        </div>
                        {ej.alternativasSugeridas.length > 0 && (
                          <div className="ml-4 mt-1">
                            <p className="text-xs text-muted-foreground mb-1">
                              Alternativas sugeridas:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {ej.alternativasSugeridas.map((alt) => (
                                <Badge
                                  key={alt.ejercicioId}
                                  variant="outline"
                                  className="text-xs"
                                  title={alt.razon}
                                >
                                  {alt.nombre}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tipo.alternativasSugeridasDelTipo.length > 0 && tipo.ejerciciosProblematicos.length === 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm font-medium mb-1">
                    Alternativas sugeridas para este tipo
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {tipo.alternativasSugeridasDelTipo.map((alt) => (
                      <Badge
                        key={alt.ejercicioId}
                        variant="outline"
                        className="text-xs"
                        title={alt.razon}
                      >
                        {alt.nombre}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
