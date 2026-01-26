import Link from 'next/link';
import { fetchRegistrosPostEntrenamiento } from '@/features/comite-tecnico/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Activity, Eye, Calendar, AlertTriangle } from 'lucide-react';

export default async function PostEntrenamientoPage() {
  const result = await fetchRegistrosPostEntrenamiento({ limit: 50 });
  const registros = result?.data || [];
  const total = result?.meta.total || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Post-Entrenamiento</h1>
          <p className="text-muted-foreground">
            {total} registro{total !== 1 ? 's' : ''} de sesiones de entrenamiento
          </p>
        </div>
      </div>

      {registros.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No hay registros</h3>
            <p className="text-muted-foreground mt-1">
              Los entrenadores registran los datos post-entrenamiento de sus atletas.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Registros Post-Entrenamiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Atleta</TableHead>
                  <TableHead>Sesion</TableHead>
                  <TableHead className="text-center">Asistencia</TableHead>
                  <TableHead className="text-center">RPE</TableHead>
                  <TableHead className="text-center">Ejercicios</TableHead>
                  <TableHead className="text-center">Sueno</TableHead>
                  <TableHead className="text-center">Dolencias</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registros.map((registro) => (
                  <TableRow key={registro.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(registro.fechaRegistro).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {registro.atleta?.nombreCompleto || 'Sin nombre'}
                    </TableCell>
                    <TableCell>
                      {registro.sesion ? (
                        <span className="text-sm">
                          Sesion {registro.sesion.numeroSesion}
                          {registro.sesion.microciclo && (
                            <span className="text-muted-foreground ml-1">
                              (Mic. {registro.sesion.microciclo.codigoMicrociclo})
                            </span>
                          )}
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={registro.asistio ? 'default' : 'destructive'}>
                        {registro.asistio ? 'Si' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          registro.rpe >= 9
                            ? 'destructive'
                            : registro.rpe >= 7
                              ? 'secondary'
                              : 'outline'
                        }
                      >
                        {registro.rpe}/10
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {registro.ejerciciosCompletados}%
                    </TableCell>
                    <TableCell className="text-center">
                      {registro.calidadSueno}/10
                    </TableCell>
                    <TableCell className="text-center">
                      {registro.dolencias && registro.dolencias.length > 0 ? (
                        <div className="flex items-center justify-center gap-1">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          <span className="text-orange-600 font-medium">
                            {registro.dolencias.length}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/comite-tecnico/post-entrenamiento/${registro.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
