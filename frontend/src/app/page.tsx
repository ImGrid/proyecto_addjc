import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-8">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            Sistema ADDJC - Frontend
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Fase 1: Setup y Configuracion Inicial Completada
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Componentes de shadcn/ui</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="mb-3 text-sm font-medium text-gray-700">
                Botones con colores del cliente:
              </h3>
              <div className="flex flex-wrap gap-2">
                <Button className="bg-primary hover:bg-primary-dark">
                  Primary
                </Button>
                <Button className="bg-secondary hover:bg-secondary-dark">
                  Secondary
                </Button>
                <Button className="bg-accent hover:bg-accent-dark text-gray-900">
                  Accent
                </Button>
                <Button className="bg-success hover:bg-success-dark">
                  Success
                </Button>
                <Button className="bg-danger hover:bg-danger-dark">
                  Danger
                </Button>
                <Button variant="outline">Outline</Button>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-medium text-gray-700">
                Badges de roles:
              </h3>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-red-100 text-red-600 hover:bg-red-100">
                  ADMINISTRADOR
                </Badge>
                <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-100">
                  COMITE_TECNICO
                </Badge>
                <Badge className="bg-green-100 text-green-600 hover:bg-green-100">
                  ENTRENADOR
                </Badge>
                <Badge className="bg-yellow-100 text-yellow-600 hover:bg-yellow-100">
                  ATLETA
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuracion</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Next.js 16.0.10</li>
              <li>React 19.2.1</li>
              <li>TypeScript 5</li>
              <li>Tailwind CSS 3.4.17</li>
              <li>shadcn/ui con componentes base instalados</li>
              <li>ESLint + Prettier configurados</li>
              <li>Colores del cliente aplicados</li>
              <li>Variables de entorno configuradas</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
