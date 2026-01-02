import { fetchEntrenadores } from '@/features/comite-tecnico/actions';
import { EntrenadoresList } from '@/features/comite-tecnico/components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCog } from 'lucide-react';

export default async function EntrenadoresPage() {
  const result = await fetchEntrenadores({ limit: 50 });

  const entrenadores = result?.data || [];
  const total = result?.meta?.total || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Entrenadores</h1>
          <p className="text-muted-foreground">
            {total} entrenador{total !== 1 ? 'es' : ''} en el sistema
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Lista de Entrenadores
          </CardTitle>
          <CardDescription>
            Todos los entrenadores registrados en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EntrenadoresList entrenadores={entrenadores} />
        </CardContent>
      </Card>
    </div>
  );
}
