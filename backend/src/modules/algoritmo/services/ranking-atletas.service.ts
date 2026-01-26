// Servicio de Ranking de Atletas para Competencias
// Usa las funciones de ranking.service.ts y score.calculator.ts
// Obtiene datos de la BD y genera ranking por categoria de peso

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CategoriaPeso } from '@prisma/client';
import {
  generarRanking,
  generarRankingGlobal,
  DatosAtletaParaRanking,
  ResultadoRanking,
} from './ranking.service';

@Injectable()
export class RankingAtletasService {
  constructor(private prisma: PrismaService) {}

  // Genera ranking de atletas para una categoria de peso especifica
  async generarRankingPorCategoria(categoriaPeso: CategoriaPeso): Promise<ResultadoRanking> {
    // 1. Obtener atletas de la categoria con sus datos completos
    const atletas = await this.obtenerAtletasConDatos(categoriaPeso);

    // 2. Generar ranking usando la logica existente
    const ranking = generarRanking(atletas, categoriaPeso);

    return this.formatearResultado(ranking);
  }

  // Genera ranking global para todas las categorias
  async generarRankingGlobal(): Promise<Map<string, ResultadoRanking>> {
    // 1. Obtener todos los atletas con sus datos
    const atletas = await this.obtenerAtletasConDatos(null);

    // 2. Generar ranking global
    const rankingsMap = generarRankingGlobal(atletas);

    // 3. Convertir Map a objeto para mejor serialización
    const resultado = new Map<string, ResultadoRanking>();
    rankingsMap.forEach((ranking, categoria) => {
      resultado.set(categoria, this.formatearResultado(ranking));
    });

    return resultado;
  }

  // Obtiene ranking global como objeto (para serializar en JSON)
  async generarRankingGlobalComoObjeto(): Promise<Record<string, ResultadoRanking>> {
    const atletas = await this.obtenerAtletasConDatos(null);
    const rankingsMap = generarRankingGlobal(atletas);

    const resultado: Record<string, ResultadoRanking> = {};
    rankingsMap.forEach((ranking, categoria) => {
      resultado[categoria] = this.formatearResultado(ranking);
    });

    return resultado;
  }

  // Obtiene los mejores N atletas de una categoria
  async obtenerMejoresAtletas(categoriaPeso: CategoriaPeso, cantidad: number = 5) {
    const ranking = await this.generarRankingPorCategoria(categoriaPeso);

    return {
      categoriaPeso,
      mejores: ranking.ranking.slice(0, cantidad),
      totalAtletas: ranking.totalAtletas,
      resumen: ranking.resumen,
    };
  }

  // Obtiene el ranking de un atleta especifico
  async obtenerRankingAtleta(atletaId: bigint) {
    // 1. Obtener datos del atleta
    const atleta = await this.prisma.atleta.findUnique({
      where: { id: atletaId },
      select: {
        id: true,
        categoriaPeso: true,
        usuario: { select: { nombreCompleto: true } },
      },
    });

    if (!atleta) {
      return null;
    }

    // 2. Generar ranking de su categoria
    const ranking = await this.generarRankingPorCategoria(atleta.categoriaPeso);

    // 3. Buscar al atleta en el ranking
    const atletaEnRanking = ranking.ranking.find(
      (a) => a.atletaId.toString() === atletaId.toString()
    );

    if (!atletaEnRanking) {
      return {
        atleta: {
          id: atleta.id.toString(),
          nombreCompleto: atleta.usuario.nombreCompleto,
          categoriaPeso: atleta.categoriaPeso,
        },
        posicion: null,
        mensaje: 'Atleta no tiene datos suficientes para ranking',
      };
    }

    return {
      atleta: {
        id: atleta.id.toString(),
        nombreCompleto: atleta.usuario.nombreCompleto,
        categoriaPeso: atleta.categoriaPeso,
      },
      posicion: atletaEnRanking.posicion,
      totalEnCategoria: ranking.totalAtletas,
      puntuacion: atletaEnRanking.puntuacion,
      score: atletaEnRanking.score,
      alertas: atletaEnRanking.alertas,
      justificacion: atletaEnRanking.justificacion,
      aptoPara: atletaEnRanking.aptoPara,
    };
  }

  // Obtiene atletas con todos sus datos necesarios para ranking
  private async obtenerAtletasConDatos(
    categoriaPeso: CategoriaPeso | null
  ): Promise<DatosAtletaParaRanking[]> {
    const whereClause: any = {};
    if (categoriaPeso) {
      whereClause.categoriaPeso = categoriaPeso;
    }

    // Obtener atletas con tests, registros y dolencias
    const atletas = await this.prisma.atleta.findMany({
      where: whereClause,
      include: {
        usuario: {
          select: { nombreCompleto: true },
        },
        testsFisicos: {
          orderBy: { fechaTest: 'desc' },
          take: 1,
          select: {
            fechaTest: true,
            pressBanca: true,
            tiron: true,
            sentadilla: true,
            barraFija: true,
            paralelas: true,
            navetteVO2max: true,
          },
        },
        registrosPostEntrenamiento: {
          where: { asistio: true },
          orderBy: { fechaRegistro: 'desc' },
          take: 7,
          select: {
            rpe: true,
            calidadSueno: true,
            estadoAnimico: true,
          },
        },
      },
    });

    // Obtener conteo de dolencias activas para cada atleta
    const atletasConDolencias = await Promise.all(
      atletas.map(async (atleta) => {
        const dolenciasActivas = await this.prisma.dolencia.count({
          where: {
            recuperado: false,
            registroPostEntrenamiento: {
              atletaId: atleta.id,
            },
          },
        });

        const ultimoTest = atleta.testsFisicos[0] || null;

        return {
          atletaId: atleta.id,
          nombreCompleto: atleta.usuario.nombreCompleto,
          categoriaPeso: atleta.categoriaPeso,
          pesoActual: atleta.pesoActual ? Number(atleta.pesoActual) : null,
          edad: atleta.edad,
          ultimoTest: ultimoTest
            ? {
                fechaTest: ultimoTest.fechaTest,
                pressBanca: ultimoTest.pressBanca ? Number(ultimoTest.pressBanca) : null,
                tiron: ultimoTest.tiron ? Number(ultimoTest.tiron) : null,
                sentadilla: ultimoTest.sentadilla ? Number(ultimoTest.sentadilla) : null,
                barraFija: ultimoTest.barraFija,
                paralelas: ultimoTest.paralelas,
                navetteVO2max: ultimoTest.navetteVO2max ? Number(ultimoTest.navetteVO2max) : null,
              }
            : null,
          ultimosRegistros: atleta.registrosPostEntrenamiento.map((r) => ({
            rpe: r.rpe,
            calidadSueno: r.calidadSueno,
            estadoAnimico: r.estadoAnimico,
          })),
          dolenciasActivas,
        };
      })
    );

    return atletasConDolencias;
  }

  // Formatea el resultado para serializar BigInt
  private formatearResultado(ranking: ResultadoRanking): ResultadoRanking {
    return {
      ...ranking,
      ranking: ranking.ranking.map((atleta) => ({
        ...atleta,
        atletaId: BigInt(atleta.atletaId.toString()),
      })),
      mejorAtleta: ranking.mejorAtleta
        ? {
            ...ranking.mejorAtleta,
            atletaId: BigInt(ranking.mejorAtleta.atletaId.toString()),
          }
        : null,
    };
  }

  // Obtiene estadisticas de ranking por categoria
  async obtenerEstadisticasRanking() {
    const categorias: CategoriaPeso[] = [
      'MENOS_60K',
      'MENOS_66K',
      'MENOS_73K',
      'MENOS_81K',
      'MENOS_90K',
      'MENOS_100K',
      'MAS_100K',
    ];

    const estadisticas = await Promise.all(
      categorias.map(async (categoria) => {
        const ranking = await this.generarRankingPorCategoria(categoria);
        const aptos = ranking.ranking.filter((a) => a.aptoPara === 'COMPETIR').length;
        const reservas = ranking.ranking.filter((a) => a.aptoPara === 'RESERVA').length;
        const noAptos = ranking.ranking.filter((a) => a.aptoPara === 'NO_APTO').length;

        return {
          categoria,
          totalAtletas: ranking.totalAtletas,
          aptos,
          reservas,
          noAptos,
          mejorPuntuacion: ranking.mejorAtleta?.puntuacion || 0,
        };
      })
    );

    return {
      estadisticas: estadisticas.filter((e) => e.totalAtletas > 0),
      totalGeneral: estadisticas.reduce((sum, e) => sum + e.totalAtletas, 0),
    };
  }
}
