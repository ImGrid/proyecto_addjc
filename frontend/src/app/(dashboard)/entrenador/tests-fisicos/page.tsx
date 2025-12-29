import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUserAction } from '@/app/actions/auth.actions';
import { fetchTestsFisicosEntrenador } from '@/features/entrenador/actions/fetch-tests-fisicos';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Plus, Calendar } from 'lucide-react';

export default async function TestsFisicosPage() {
  // Verificar autenticacion
  const authResult = await getCurrentUserAction();

  if (!authResult.success || !authResult.user) {
    redirect('/login');
  }

  // Cargar tests
  const testsResult = await fetchTestsFisicosEntrenador({ limit: 50 });
  const tests = testsResult?.data || [];
  const total = testsResult?.meta.total || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tests Fisicos</h1>
          <p className="text-muted-foreground">
            {total} test{total !== 1 ? 's' : ''} registrado{total !== 1 ? 's' : ''}
          </p>
        </div>
        <Button asChild>
          <Link href="/entrenador/tests-fisicos/nuevo">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Test
          </Link>
        </Button>
      </div>

      {tests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No hay tests registrados</h3>
            <p className="text-muted-foreground mt-1 mb-4">
              Registra el primer test fisico de tus atletas.
            </p>
            <Button asChild>
              <Link href="/entrenador/tests-fisicos/nuevo">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Test
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tests.map((test) => (
            <Card key={test.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {new Date(test.fechaTest).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  {test.atleta && (
                    <Badge variant="outline">{test.atleta.nombreCompleto}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
                  {test.pressBanca && (
                    <div>
                      <p className="text-muted-foreground">Press Banca</p>
                      <p className="font-medium">{test.pressBanca} kg</p>
                    </div>
                  )}
                  {test.tiron && (
                    <div>
                      <p className="text-muted-foreground">Tiron</p>
                      <p className="font-medium">{test.tiron} kg</p>
                    </div>
                  )}
                  {test.sentadilla && (
                    <div>
                      <p className="text-muted-foreground">Sentadilla</p>
                      <p className="font-medium">{test.sentadilla} kg</p>
                    </div>
                  )}
                  {test.barraFija !== null && (
                    <div>
                      <p className="text-muted-foreground">Barra Fija</p>
                      <p className="font-medium">{test.barraFija} reps</p>
                    </div>
                  )}
                  {test.paralelas !== null && (
                    <div>
                      <p className="text-muted-foreground">Paralelas</p>
                      <p className="font-medium">{test.paralelas} reps</p>
                    </div>
                  )}
                  {test.navettePalier && (
                    <div>
                      <p className="text-muted-foreground">Navette</p>
                      <p className="font-medium">Palier {test.navettePalier}</p>
                    </div>
                  )}
                  {test.navetteVO2max && (
                    <div>
                      <p className="text-muted-foreground">VO2max</p>
                      <p className="font-medium">{test.navetteVO2max}</p>
                    </div>
                  )}
                </div>
                {test.observaciones && (
                  <p className="mt-3 text-sm text-muted-foreground">{test.observaciones}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
