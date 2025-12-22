import { redirect } from 'next/navigation';
import { fetchVO2maxEvolution } from '@/features/progreso/actions/fetch-vo2max-evolution';
import { fetchRPEWeekly } from '@/features/progreso/actions/fetch-rpe-weekly';
import { fetchTestsComparison } from '@/features/progreso/actions/fetch-tests-comparison';
import { fetchSleepData } from '@/features/progreso/actions/fetch-sleep-data';
import { VO2maxEvolutionChart } from '@/features/progreso/components/vo2max-evolution-chart';
import { RPEWeeklyChart } from '@/features/progreso/components/rpe-weekly-chart';
import { TestsComparisonChart } from '@/features/progreso/components/tests-comparison-chart';
import { SleepQualityChart } from '@/features/progreso/components/sleep-quality-chart';
import { ProgresoStatsGrid } from '@/features/progreso/components/progreso-stats-grid';
import type { ProgresoStats } from '@/features/progreso/types/progreso.types';

// Página de progreso del atleta
// Server Component que hace fetch de todos los datos y los pasa a componentes cliente
export default async function ProgresoPage() {
  // Hacer fetch de todos los datos en paralelo para mejor performance
  const [vo2maxData, rpeData, testsComparison, sleepData] = await Promise.all([
    fetchVO2maxEvolution(),
    fetchRPEWeekly(),
    fetchTestsComparison(),
    fetchSleepData(),
  ]);

  // Si algún fetch falla (usuario no autenticado), redirigir a login
  if (vo2maxData === null || rpeData === null || testsComparison === null || sleepData === null) {
    redirect('/login');
  }

  // Calcular estadísticas para el grid de KPIs
  const stats: ProgresoStats = {
    // VO2max actual (último valor)
    vo2maxActual: vo2maxData.length > 0 ? vo2maxData[vo2maxData.length - 1].vo2max : null,
    vo2maxClasificacion: vo2maxData.length > 0 ? vo2maxData[vo2maxData.length - 1].clasificacion : null,

    // RPE promedio de las últimas 4 semanas
    rpePromedio: rpeData.length > 0
      ? rpeData.slice(-4).reduce((acc, week) => acc + week.rpePromedio, 0) / Math.min(4, rpeData.length)
      : null,

    // Cantidad de tests realizados
    testsRealizados: vo2maxData.length,

    // Calidad de sueño promedio (últimos 14 días)
    calidadSuenoPromedio: sleepData.length > 0
      ? sleepData.slice(-14).reduce((acc, day) => acc + day.calidadSueno, 0) / Math.min(14, sleepData.length)
      : null,

    // Horas de sueño promedio (últimos 14 días)
    horasSuenoPromedio: sleepData.length > 0
      ? sleepData.slice(-14).reduce((acc, day) => acc + day.horasSueno, 0) / Math.min(14, sleepData.length)
      : null,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mi Progreso</h1>
        <p className="text-gray-600 mt-1">
          Análisis de tu evolución física y recuperación
        </p>
      </div>

      {/* Grid de KPIs principales */}
      <ProgresoStatsGrid stats={stats} />

      {/* Gráfico principal: Evolución VO2max */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Evolución VO2max</h2>
          <p className="text-sm text-gray-600 mt-1">
            Capacidad aeróbica medida a través del test de Navette
          </p>
        </div>
        <VO2maxEvolutionChart data={vo2maxData} />
      </div>

      {/* Grid de 2 columnas: RPE y Sueño */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RPE Semanal */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900">RPE Semanal</h2>
            <p className="text-sm text-gray-600 mt-1">
              Carga de trabajo percibida por semana
            </p>
          </div>
          <RPEWeeklyChart data={rpeData} />
        </div>

        {/* Calidad de Sueño */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Calidad de Sueño</h2>
            <p className="text-sm text-gray-600 mt-1">
              Recuperación y descanso nocturno
            </p>
          </div>
          <SleepQualityChart data={sleepData} />
        </div>
      </div>

      {/* Comparación de Tests Físicos */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Comparación Tests Físicos</h2>
          <p className="text-sm text-gray-600 mt-1">
            Test actual vs mejor marca personal
          </p>
        </div>
        <TestsComparisonChart data={testsComparison} />
      </div>
    </div>
  );
}
