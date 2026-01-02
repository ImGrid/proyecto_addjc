import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell } from 'lucide-react';

export default async function RecomendacionesPage() {
  // El modulo de recomendaciones no existe aun en el backend
  // Por ahora es una vista informativa

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Recomendaciones</h1>
          <p className="text-muted-foreground">
            Sugerencias del algoritmo de entrenamiento
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Recomendaciones del Sistema
          </CardTitle>
          <CardDescription>
            Alertas y sugerencias basadas en el analisis de datos de entrenamiento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Modulo en desarrollo</h3>
            <p className="text-muted-foreground mt-1">
              El sistema de recomendaciones esta siendo implementado.
              <br />
              Aqui podras revisar y aprobar las sugerencias del algoritmo.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
