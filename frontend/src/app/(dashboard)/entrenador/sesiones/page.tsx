import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUserAction } from '@/app/actions/auth.actions';
import { fetchSesiones, fetchMicrociclosParaSelector } from '@/features/comite-tecnico/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarClock, Plus, Calendar, Clock, Activity } from 'lucide-react';
import { AUTH_ROUTES, ENTRENADOR_ROUTES } from '@/lib/routes';
import { formatDateFull } from '@/lib/date-utils';
import { SesionesFilters } from '@/features/comite-tecnico/components/sesiones-filters';
import { SesionesPagination } from '@/features/comite-tecnico/components/sesiones-pagination';

// Mapeo de tipos de sesion a colores
const TIPO_SESION_COLORS: Record<string, string> = {
  ENTRENAMIENTO: 'bg-blue-100 text-blue-800',
  TEST: 'bg-purple-100 text-purple-800',
  RECUPERACION: 'bg-green-100 text-green-800',
  DESCANSO: 'bg-gray-100 text-gray-800',
  COMPETENCIA: 'bg-orange-100 text-orange-800',
};

// Mapeo de tipos de sesion a nombres legibles
const TIPO_SESION_LABELS: Record<string, string> = {
  ENTRENAMIENTO: 'Entrenamiento',
  TEST: 'Test',
  RECUPERACION: 'Recuperacion',
  DESCANSO: 'Descanso',
  COMPETENCIA: 'Competencia',
};

interface PageProps {
  searchParams: Promise<{
    microcicloId?: string;
    fecha?: string;
    tipoSesion?: string;
    page?: string;
  }>;
}

export default async function SesionesEntrenadorPage({ searchParams }: PageProps) {
  // Verificar autenticacion
  const authResult = await getCurrentUserAction();

  if (!authResult.success || !authResult.user) {
    redirect(AUTH_ROUTES.login);
  }

  // Leer filtros de la URL
  const params = await searchParams;
  const microcicloId = params.microcicloId || undefined;
  const fecha = params.fecha || undefined;
  const tipoSesion = params.tipoSesion || undefined;
  const page = params.page ? parseInt(params.page, 10) : 1;
  const limit = 10;

  // Cargar sesiones y microciclos en paralelo
  const [sesionesResult, microciclos] = await Promise.all([
    fetchSesiones({ microcicloId, fecha, page, limit }),
    fetchMicrociclosParaSelector(),
  ]);

  const sesiones = sesionesResult?.data || [];
  const total = sesionesResult?.meta.total || 0;
  const totalPages = sesionesResult?.meta.totalPages || 1;

  // Filtro client-side por tipoSesion (el backend no soporta este filtro en findAll)
  const sesionesFiltradas = tipoSesion
    ? sesiones.filter((s) => s.tipoSesion === tipoSesion)
    : sesiones;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sesiones</h1>
          <p className="text-muted-foreground">
            {total} sesion{total !== 1 ? 'es' : ''} disponible{total !== 1 ? 's' : ''}
          </p>
        </div>
        <Button asChild>
          <Link href={ENTRENADOR_ROUTES.sesiones.nuevo}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Sesion
          </Link>
        </Button>
      </div>

      {/* Filtros */}
      <SesionesFilters microciclos={microciclos || []} />

      {sesionesFiltradas.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CalendarClock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No hay sesiones registradas</h3>
            <p className="text-muted-foreground mt-1 mb-4">
              {tipoSesion || microcicloId || fecha
                ? 'No se encontraron sesiones con los filtros aplicados.'
                : 'Crea la primera sesion de entrenamiento.'}
            </p>
            {!tipoSesion && !microcicloId && !fecha && (
              <Button asChild>
                <Link href={ENTRENADOR_ROUTES.sesiones.nuevo}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Sesion
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sesionesFiltradas.map((sesion) => (
            <Card key={sesion.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDateFull(sesion.fecha)}</span>
                    <Badge variant="outline">Sesion #{sesion.numeroSesion}</Badge>
                  </div>
                  <Badge className={TIPO_SESION_COLORS[sesion.tipoSesion] || 'bg-gray-100'}>
                    {TIPO_SESION_LABELS[sesion.tipoSesion] || sesion.tipoSesion}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Duracion</p>
                      <p className="font-medium">{sesion.duracionPlanificada} min</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Intensidad</p>
                      <p className="font-medium">{sesion.intensidadPlanificada}%</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Volumen</p>
                    <p className="font-medium">{sesion.volumenPlanificado}</p>
                  </div>
                </div>
                {sesion.microciclo && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-muted-foreground">
                      Microciclo #{sesion.microciclo.codigoMicrociclo}
                    </p>
                  </div>
                )}
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={ENTRENADOR_ROUTES.sesiones.detalle(sesion.id)}>
                      Ver detalle
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={ENTRENADOR_ROUTES.sesiones.editar(sesion.id)}>
                      Editar
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Paginacion */}
      <SesionesPagination
        currentPage={page}
        totalPages={totalPages}
        total={total}
      />
    </div>
  );
}
