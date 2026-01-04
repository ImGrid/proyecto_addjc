import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUserAction } from '@/app/actions/auth.actions';
import { fetchRegistrosEntrenador } from '@/features/entrenador/actions/fetch-registros';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, Plus, Calendar, AlertTriangle } from 'lucide-react';
import { AUTH_ROUTES } from '@/lib/routes';

export default async function PostEntrenamientoPage() {
  // Verificar autenticacion
  const authResult = await getCurrentUserAction();

  if (!authResult.success || !authResult.user) {
    redirect(AUTH_ROUTES.login);
  }

  // Cargar registros
  const registrosResult = await fetchRegistrosEntrenador({ limit: 50 });
  const registros = registrosResult?.data || [];
  const total = registrosResult?.meta.total || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Post-Entrenamiento</h1>
          <p className="text-muted-foreground">
            {total} registro{total !== 1 ? 's' : ''} de sesiones
          </p>
        </div>
        <Button asChild>
          <Link href="/entrenador/post-entrenamiento/nuevo">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Registro
          </Link>
        </Button>
      </div>

      {registros.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No hay registros</h3>
            <p className="text-muted-foreground mt-1 mb-4">
              Registra los datos post-entrenamiento de tus atletas.
            </p>
            <Button asChild>
              <Link href="/entrenador/post-entrenamiento/nuevo">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Registro
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {registros.map((registro) => (
            <Card key={registro.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {new Date(registro.fechaRegistro).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        day: '2-digit',
                        month: 'long',
                      })}
                      {registro.sesion && ` - Sesion ${registro.sesion.numeroSesion}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {registro.atleta && (
                      <Badge variant="outline">{registro.atleta.nombreCompleto}</Badge>
                    )}
                    <Badge variant={registro.asistio ? 'default' : 'destructive'}>
                      {registro.asistio ? 'Asistio' : 'Falta'}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">RPE</p>
                    <p className="font-medium">{registro.rpe}/10</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Ejercicios</p>
                    <p className="font-medium">{registro.ejerciciosCompletados}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Intensidad</p>
                    <p className="font-medium">{registro.intensidadAlcanzada}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Sueno</p>
                    <p className="font-medium">{registro.calidadSueno}/10</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Estado</p>
                    <p className="font-medium">{registro.estadoAnimico}/10</p>
                  </div>
                </div>

                {registro.dolencias && registro.dolencias.length > 0 && (
                  <div className="mt-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span className="text-sm text-muted-foreground">Dolencias:</span>
                    <div className="flex flex-wrap gap-1">
                      {registro.dolencias.map((d) => (
                        <Badge key={d.id} variant="destructive" className="text-xs">
                          {d.zona} (nivel {d.nivel})
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {!registro.asistio && registro.motivoInasistencia && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    <span className="font-medium">Motivo:</span> {registro.motivoInasistencia}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
