import { fetchMicrociclos } from '@/features/comite-tecnico/actions';
import { MicrociclosList } from '@/features/comite-tecnico/components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function MicrociclosPage() {
  const result = await fetchMicrociclos({ limit: 50 });

  const microciclos = result?.data || [];
  const total = result?.meta?.total || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/comite-tecnico/planificacion">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Microciclos</h1>
            <p className="text-muted-foreground">
              {total} microciclo{total !== 1 ? 's' : ''} en el sistema
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/comite-tecnico/planificacion/microciclos/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Microciclo
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Microciclos
          </CardTitle>
          <CardDescription>
            Semanas de entrenamiento planificadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MicrociclosList microciclos={microciclos} />
        </CardContent>
      </Card>
    </div>
  );
}
