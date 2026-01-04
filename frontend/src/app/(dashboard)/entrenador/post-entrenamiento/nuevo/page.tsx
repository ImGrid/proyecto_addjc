import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUserAction } from '@/app/actions/auth.actions';
import { fetchAtletasParaSelector } from '@/features/entrenador/actions/fetch-mis-atletas';
import { fetchSesionesParaSelector } from '@/features/entrenador/actions/fetch-sesiones';
import { CreateRegistroForm } from '@/features/entrenador/components/forms/create-registro-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { AUTH_ROUTES, ENTRENADOR_ROUTES } from '@/lib/routes';

export default async function NuevoRegistroPage() {
  // Verificar autenticacion
  const authResult = await getCurrentUserAction();

  if (!authResult.success || !authResult.user) {
    redirect(AUTH_ROUTES.login);
  }

  // Cargar atletas y sesiones en paralelo
  const [atletas, sesiones] = await Promise.all([
    fetchAtletasParaSelector(),
    fetchSesionesParaSelector(100), // Obtener mas sesiones para tener opciones
  ]);

  if (!atletas) {
    redirect(ENTRENADOR_ROUTES.dashboard);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/entrenador/post-entrenamiento">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Nuevo Registro Post-Entrenamiento</h1>
          <p className="text-muted-foreground">
            Registra los datos de una sesion de entrenamiento
          </p>
        </div>
      </div>

      <CreateRegistroForm
        atletas={atletas}
        sesiones={sesiones || []}
      />
    </div>
  );
}
