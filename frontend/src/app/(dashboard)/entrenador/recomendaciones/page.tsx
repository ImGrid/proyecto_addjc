import { fetchRecomendaciones } from '@/features/algoritmo/actions/fetch-recomendaciones';
import { RecomendacionesFiltro } from '@/features/algoritmo/components/recomendaciones-filtro';
import { RecomendacionesList } from '@/features/algoritmo/components/recomendaciones-list';
import { RecomendacionesPagination } from '@/features/algoritmo/components/recomendaciones-pagination';

interface PageProps {
  searchParams: Promise<{
    estado?: string;
    page?: string;
  }>;
}

export default async function RecomendacionesEntrenadorPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const estado = params.estado || undefined;
  const page = params.page ? parseInt(params.page, 10) : 1;
  const limit = 10;

  const data = await fetchRecomendaciones({ estado, page, limit });

  const recomendaciones = data?.data || [];
  const total = data?.meta.total || 0;
  const totalPages = data?.meta.totalPages || 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Recomendaciones</h1>
        <p className="text-muted-foreground">
          {total} recomendacion{total !== 1 ? 'es' : ''} - Recomendaciones del algoritmo para tus atletas (solo lectura)
        </p>
      </div>

      <RecomendacionesFiltro />

      <RecomendacionesList
        recomendaciones={recomendaciones}
        detalleBaseHref="/entrenador/recomendaciones"
      />

      <RecomendacionesPagination
        currentPage={page}
        totalPages={totalPages}
        total={total}
      />
    </div>
  );
}
