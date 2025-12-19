import { getCurrentUserAction } from '@/app/actions/auth.actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Settings, Database, Activity, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboard() {
  const result = await getCurrentUserAction();

  if (!result.success || !result.user) {
    return null;
  }

  const { user } = result;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-secondary">Dashboard Administrador</h1>
        <p className="text-muted-foreground">
          Bienvenido, {user.nombreCompleto}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-center p-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white shadow-lg">
              <Users className="h-7 w-7" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-muted-foreground">Usuarios Totales</p>
              <p className="text-2xl font-bold mt-1">5</p>
              <p className="text-xs text-muted-foreground mt-0.5">En el sistema</p>
            </div>
          </div>
        </Card>

        <Card className="border-0 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-center p-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#f093fb] to-[#f5576c] text-white shadow-lg">
              <Activity className="h-7 w-7" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-muted-foreground">Atletas</p>
              <p className="text-2xl font-bold mt-1">1</p>
              <p className="text-xs text-muted-foreground mt-0.5">Registrados</p>
            </div>
          </div>
        </Card>

        <Card className="border-0 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-center p-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#4facfe] to-[#00f2fe] text-white shadow-lg">
              <Users className="h-7 w-7" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-muted-foreground">Entrenadores</p>
              <p className="text-2xl font-bold mt-1">1</p>
              <p className="text-xs text-muted-foreground mt-0.5">Activos</p>
            </div>
          </div>
        </Card>

        <Card className="border-0 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-center p-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#fa709a] to-[#fee140] text-white shadow-lg">
              <Database className="h-7 w-7" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-muted-foreground">Sistema</p>
              <p className="text-2xl font-bold mt-1">OK</p>
              <p className="text-xs text-muted-foreground mt-0.5">Todo funcionando</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Gestión de Usuarios</CardTitle>
            <CardDescription>
              Administra usuarios, roles y permisos del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/usuarios">
              <Button className="w-full bg-gradient-to-br from-primary to-primary-dark hover:shadow-lg hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300">
                <Users className="mr-2 h-4 w-4" />
                Ver Usuarios
                <ArrowRight className="ml-auto h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuración</CardTitle>
            <CardDescription>
              Ajustes del sistema y parámetros generales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" disabled>
              <Settings className="mr-2 h-4 w-4" />
              Configurar Sistema
              <ArrowRight className="ml-auto h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tu Rol</CardTitle>
          <CardDescription>
            Informacion sobre tus permisos y accesos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Rol Actual</p>
            <Badge className="mt-1" variant="default">
              {user.rol.replace('_', ' ')}
            </Badge>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-2">Permisos</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Gestion completa de usuarios</li>
              <li>Configuracion del sistema</li>
              <li>Auditoria y logs</li>
              <li>Backups y mantenimiento</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
