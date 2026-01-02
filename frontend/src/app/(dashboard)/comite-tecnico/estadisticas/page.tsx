import { fetchAtletas } from '@/features/comite-tecnico/actions';
import { EstadisticasView } from './estadisticas-view';

export default async function EstadisticasPage() {
  // Obtener lista de atletas para el selector
  const atletasResult = await fetchAtletas({ limit: 100 });

  const atletas = (atletasResult?.data || []).map((a) => ({
    id: a.id,
    nombreCompleto: a.usuario.nombreCompleto,
    club: a.club,
    categoria: a.categoria,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Estadisticas de Atletas</h1>
        <p className="text-muted-foreground">
          Analiza la evolucion y rendimiento de los atletas
        </p>
      </div>

      <EstadisticasView atletas={atletas} />
    </div>
  );
}
