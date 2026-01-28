import { fetchAtletas } from '@/features/comite-tecnico/actions/fetch-atletas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { COMITE_TECNICO_ROUTES } from '@/lib/routes';

export default async function AnalisisCTPage() {
  const atletasData = await fetchAtletas({ limit: 100 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analisis de Rendimiento</h1>
        <p className="text-muted-foreground">
          Seleccione un atleta para ver su analisis completo de rendimiento
        </p>
      </div>

      {!atletasData || atletasData.data.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          No se encontraron atletas.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {atletasData.data.map((atleta) => (
            <Link
              key={atleta.id}
              href={COMITE_TECNICO_ROUTES.analisis.detalle(atleta.id)}
            >
              <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    {atleta.usuario.nombreCompleto}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Categoria: {atleta.categoriaPeso}</p>
                    {atleta.club && <p>Club: {atleta.club}</p>}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
