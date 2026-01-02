import { fetchMesociclos } from '@/features/comite-tecnico/actions';
import { MesociclosList } from '@/features/comite-tecnico/components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Layers, Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function MesociclosPage() {
  const result = await fetchMesociclos({ limit: 50 });

  const mesociclos = result?.data || [];
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
            <h1 className="text-3xl font-bold">Mesociclos</h1>
            <p className="text-muted-foreground">
              {total} mesociclo{total !== 1 ? 's' : ''} en el sistema
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/comite-tecnico/planificacion/mesociclos/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Mesociclo
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Mesociclos
          </CardTitle>
          <CardDescription>
            Etapas de entrenamiento dentro de los macrociclos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MesociclosList mesociclos={mesociclos} />
        </CardContent>
      </Card>
    </div>
  );
}
