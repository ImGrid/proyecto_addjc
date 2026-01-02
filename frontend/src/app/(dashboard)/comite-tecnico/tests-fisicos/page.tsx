import Link from 'next/link';
import { fetchTestsFisicos } from '@/features/comite-tecnico/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { ClipboardList, Eye } from 'lucide-react';

export default async function TestsFisicosPage() {
  const result = await fetchTestsFisicos({ limit: 50 });

  const tests = result?.data || [];
  const total = result?.meta?.total || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tests Fisicos</h1>
          <p className="text-muted-foreground">
            {total} test{total !== 1 ? 's' : ''} registrado{total !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Historial de Tests
          </CardTitle>
          <CardDescription>
            Todos los tests fisicos realizados a los atletas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No hay tests registrados</h3>
              <p className="text-muted-foreground mt-1">
                Los tests apareceran aqui cuando los entrenadores los registren.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Atleta</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Press Banca</TableHead>
                    <TableHead>Sentadilla</TableHead>
                    <TableHead>Navette</TableHead>
                    <TableHead>VO2max</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tests.map((test) => (
                    <TableRow key={test.id}>
                      <TableCell className="font-medium">
                        {test.atleta?.nombreCompleto || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {new Date(test.fechaTest).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>{test.pressBanca || '-'}</TableCell>
                      <TableCell>{test.sentadilla || '-'}</TableCell>
                      <TableCell>{test.navettePalier || '-'}</TableCell>
                      <TableCell>
                        {test.navetteVO2max ? (
                          <Badge variant="outline">{test.navetteVO2max}</Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/comite-tecnico/tests-fisicos/${test.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
