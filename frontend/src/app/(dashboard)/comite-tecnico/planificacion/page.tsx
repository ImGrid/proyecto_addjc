import { fetchMacrociclos } from '@/features/comite-tecnico/actions';
import { MacrociclosList } from '@/features/comite-tecnico/components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Plus } from 'lucide-react';
import Link from 'next/link';

export default async function PlanificacionPage() {
  const result = await fetchMacrociclos({ limit: 50 });

  const macrociclos = result?.data || [];
  const total = result?.meta?.total || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Planificacion</h1>
          <p className="text-muted-foreground">
            {total} macrociclo{total !== 1 ? 's' : ''} en el sistema
          </p>
        </div>
        <Button asChild>
          <Link href="/comite-tecnico/planificacion/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Macrociclo
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Macrociclos
          </CardTitle>
          <CardDescription>
            Gestion de la planificacion deportiva a largo plazo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MacrociclosList macrociclos={macrociclos} />
        </CardContent>
      </Card>
    </div>
  );
}
