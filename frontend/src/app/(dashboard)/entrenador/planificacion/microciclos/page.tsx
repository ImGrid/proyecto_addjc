import { redirect } from 'next/navigation';
import { getCurrentUserAction } from '@/app/actions/auth.actions';
import { fetchMicrociclos } from '@/features/comite-tecnico/actions';
import { MicrociclosList } from '@/features/entrenador/components/planificacion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { AUTH_ROUTES } from '@/lib/routes';

export default async function EntrenadorMicrociclosPage() {
  // Verificar autenticacion
  const authResult = await getCurrentUserAction();

  if (!authResult.success || !authResult.user) {
    redirect(AUTH_ROUTES.login);
  }

  const result = await fetchMicrociclos({ limit: 50 });

  const microciclos = result?.data || [];
  const total = result?.meta?.total || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Microciclos</h1>
        <p className="text-muted-foreground">
          {total} microciclo{total !== 1 ? 's' : ''} disponible{total !== 1 ? 's' : ''}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Microciclos
          </CardTitle>
          <CardDescription>
            Planificacion semanal de tus atletas asignados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MicrociclosList microciclos={microciclos} />
        </CardContent>
      </Card>
    </div>
  );
}
