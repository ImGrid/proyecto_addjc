'use client';

import { useState, useEffect, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, TrendingDown, Minus, BarChart3, Activity, Dumbbell } from 'lucide-react';
import {
  fetchAtletaEvolucion,
  TIPOS_TEST,
  type AtletaEvolucion,
} from '@/features/comite-tecnico/actions';
import { EvolucionChart } from './evolucion-chart';

interface Atleta {
  id: string;
  nombreCompleto: string;
  club: string;
  categoria: string;
}

interface EstadisticasViewProps {
  atletas: Atleta[];
}

export function EstadisticasView({ atletas }: EstadisticasViewProps) {
  const [selectedAtleta, setSelectedAtleta] = useState<string>('');
  const [selectedTipoTest, setSelectedTipoTest] = useState<string>('navette');
  const [evolucion, setEvolucion] = useState<AtletaEvolucion | null>(null);
  const [isPending, startTransition] = useTransition();

  // Cargar datos cuando cambia el atleta o tipo de test
  useEffect(() => {
    if (!selectedAtleta) {
      setEvolucion(null);
      return;
    }

    startTransition(async () => {
      const data = await fetchAtletaEvolucion(selectedAtleta, selectedTipoTest);
      setEvolucion(data);
    });
  }, [selectedAtleta, selectedTipoTest]);

  // Obtener el atleta seleccionado
  const atletaSeleccionado = atletas.find((a) => a.id === selectedAtleta);

  // Obtener tipo de test seleccionado
  const tipoTestInfo = TIPOS_TEST.find((t) => t.value === selectedTipoTest);

  // Renderizar icono de tendencia
  const renderTendencia = (tendencia: string | undefined) => {
    if (!tendencia) return null;

    switch (tendencia) {
      case 'ascendente':
        return (
          <Badge variant="default" className="bg-green-500">
            <TrendingUp className="h-3 w-3 mr-1" />
            Ascendente
          </Badge>
        );
      case 'descendente':
        return (
          <Badge variant="destructive">
            <TrendingDown className="h-3 w-3 mr-1" />
            Descendente
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Minus className="h-3 w-3 mr-1" />
            Estable
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Selectores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Seleccionar Atleta y Metrica
          </CardTitle>
          <CardDescription>
            Elige un atleta y el tipo de test para ver su evolucion
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="atleta">Atleta</Label>
              <Select value={selectedAtleta} onValueChange={setSelectedAtleta}>
                <SelectTrigger id="atleta">
                  <SelectValue placeholder="Selecciona un atleta" />
                </SelectTrigger>
                <SelectContent>
                  {atletas.map((atleta) => (
                    <SelectItem key={atleta.id} value={atleta.id}>
                      {atleta.nombreCompleto} - {atleta.club}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipoTest">Tipo de Test</Label>
              <Select value={selectedTipoTest} onValueChange={setSelectedTipoTest}>
                <SelectTrigger id="tipoTest">
                  <SelectValue placeholder="Selecciona tipo de test" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_TEST.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label} ({tipo.unidad})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estado de carga */}
      {isPending && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Cargando estadisticas...</span>
        </div>
      )}

      {/* Mensaje si no hay atleta seleccionado */}
      {!selectedAtleta && !isPending && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Activity className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Selecciona un atleta</h3>
            <p className="text-muted-foreground mt-1">
              Elige un atleta del selector para ver sus estadisticas y evolucion
            </p>
          </CardContent>
        </Card>
      )}

      {/* Contenido cuando hay atleta seleccionado */}
      {selectedAtleta && !isPending && (
        <>
          {/* Info del atleta y KPIs */}
          {atletaSeleccionado && (
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Atleta</CardDescription>
                  <CardTitle className="text-lg">{atletaSeleccionado.nombreCompleto}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {atletaSeleccionado.club} - {atletaSeleccionado.categoria}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Tests Registrados</CardDescription>
                  <CardTitle className="text-2xl">
                    {evolucion?.tests?.length || 0}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {tipoTestInfo?.label}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Tendencia</CardDescription>
                </CardHeader>
                <CardContent>
                  {renderTendencia(evolucion?.tendencia)}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Progreso Total</CardDescription>
                  <CardTitle className="text-2xl">
                    {evolucion?.mejora
                      ? `${evolucion.mejora.porcentaje >= 0 ? '+' : ''}${evolucion.mejora.porcentaje.toFixed(1)}%`
                      : 'N/A'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {evolucion?.mejora
                      ? `${evolucion.mejora.absoluto >= 0 ? '+' : ''}${evolucion.mejora.absoluto.toFixed(2)} ${tipoTestInfo?.unidad}`
                      : 'Sin datos suficientes'}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Grafico de evolucion */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5" />
                Evolucion de {tipoTestInfo?.label}
              </CardTitle>
              <CardDescription>
                Historial de resultados a lo largo del tiempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {evolucion && evolucion.tests && evolucion.tests.length > 0 ? (
                <EvolucionChart
                  data={evolucion.tests}
                  unidad={tipoTestInfo?.unidad || ''}
                  nombreTest={tipoTestInfo?.label || ''}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/50 rounded-lg">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Sin datos disponibles</h3>
                  <p className="text-muted-foreground mt-1">
                    No hay registros de {tipoTestInfo?.label} para este atleta
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
