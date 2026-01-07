import { redirect } from 'next/navigation';
import { getCurrentUserAction } from '@/app/actions/auth.actions';
import { fetchMesociclos } from '@/features/comite-tecnico/actions';
import { MesociclosList } from '@/features/entrenador/components/planificacion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Layers } from 'lucide-react';
import { AUTH_ROUTES } from '@/lib/routes';

export default async function EntrenadorMesociclosPage() {
  // Verificar autenticacion
  const authResult = await getCurrentUserAction();

  if (!authResult.success || !authResult.user) {
    redirect(AUTH_ROUTES.login);
  }

  const result = await fetchMesociclos({ limit: 50 });

  const mesociclos = result?.data || [];
  const total = result?.meta?.total || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mesociclos</h1>
        <p className="text-muted-foreground">
          {total} mesociclo{total !== 1 ? 's' : ''} disponible{total !== 1 ? 's' : ''}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Mesociclos
          </CardTitle>
          <CardDescription>
            Etapas de entrenamiento mensual de tus atletas asignados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MesociclosList mesociclos={mesociclos} />
        </CardContent>
      </Card>
    </div>
  );
}
