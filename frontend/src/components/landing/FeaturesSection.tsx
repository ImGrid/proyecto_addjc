import { Calendar, BarChart, Bell, Trophy } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    icon: Calendar,
    title: 'Planificacion Inteligente',
    description: 'Sistema completo de macrociclos, mesociclos y microciclos adaptados a tus competencias.',
  },
  {
    icon: BarChart,
    title: 'Seguimiento Personalizado',
    description: 'Monitorea el progreso de cada atleta con tests fisicos y registros post-entrenamiento.',
  },
  {
    icon: Bell,
    title: 'Recomendaciones Automaticas',
    description: 'Algoritmo inteligente que sugiere ajustes en la carga segun el rendimiento del atleta.',
  },
  {
    icon: Trophy,
    title: 'Gestion por Roles',
    description: 'Acceso diferenciado para administradores, comite tecnico, entrenadores y atletas.',
  },
];

export function FeaturesSection() {
  return (
    <section className="bg-muted/40 py-20">
      <div className="container mx-auto px-6">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold">Funcionalidades del Sistema</h2>
          <p className="text-xl text-muted-foreground">
            Todo lo que necesitas para optimizar el rendimiento deportivo
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title} className="transition-transform hover:-translate-y-2">
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <feature.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
