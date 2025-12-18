import { getCurrentUserAction } from '@/app/actions/auth.actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, BarChart, Bell, Activity } from 'lucide-react';

export default async function AtletaDashboard() {
  const result = await getCurrentUserAction();

  if (!result.success || !result.user) {
    return null;
  }

  const { user } = result;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Atleta</h1>
        <p className="text-muted-foreground">
          Bienvenido, {user.nombreCompleto}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mi Plan</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              Sin plan activo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tests Fisicos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Realizados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mi Progreso</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              Sin datos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recomendaciones</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Nuevas
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tu Rol</CardTitle>
          <CardDescription>
            Informacion sobre tus permisos y accesos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Rol Actual</p>
            <Badge className="mt-1" variant="default">
              {user.rol.replace('_', ' ')}
            </Badge>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-2">Permisos</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Visualizacion de mi plan de entrenamiento</li>
              <li>Visualizacion de mi progreso y graficos</li>
              <li>Visualizacion de recomendaciones</li>
              <li>Solo lectura (no puedo modificar nada)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
