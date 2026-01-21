// Controller para exponer el analisis de rendimiento por ejercicio
// Permite al frontend consultar el analisis y recomendaciones de un atleta

import { Controller, Get, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { AnalisisRendimientoService } from '../services/analisis-rendimiento.service';
import { evaluarReglas, ContextoEvaluacion } from '../reglas';

@Controller('algoritmo/analisis')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalisisRendimientoController {
  constructor(private readonly analisisService: AnalisisRendimientoService) {}

  // Obtener analisis completo de rendimiento de un atleta
  // GET /api/algoritmo/analisis/:atletaId
  @Get(':atletaId')
  @Roles('COMITE_TECNICO', 'ENTRENADOR', 'ADMINISTRADOR')
  async obtenerAnalisis(
    @Param('atletaId', ParseIntPipe) atletaId: number,
    @Query('dias') dias?: string
  ) {
    const diasAnalisis = dias ? parseInt(dias, 10) : 30;
    const atletaIdBigInt = BigInt(atletaId);

    // Ejecutar analisis
    const analisis = await this.analisisService.analizarRendimientoAtleta(
      atletaIdBigInt,
      diasAnalisis
    );

    // Evaluar reglas para generar recomendaciones
    const contexto: ContextoEvaluacion = {
      atletaId: atletaIdBigInt,
      nombreAtleta: analisis.nombreAtleta,
      rendimientoPorTipo: analisis.rendimientoPorTipo,
      ejerciciosProblematicos: analisis.ejerciciosProblematicos,
      diasAnalizados: analisis.periodoAnalisis.diasAnalizados,
    };

    const recomendaciones = evaluarReglas(contexto);

    // Formatear respuesta (convertir BigInt a string para JSON)
    return {
      atletaId: analisis.atletaId.toString(),
      nombreAtleta: analisis.nombreAtleta,
      periodoAnalisis: analisis.periodoAnalisis,
      resumenGeneral: analisis.resumenGeneral,
      rendimientoPorTipo: analisis.rendimientoPorTipo.map((tipo) => ({
        ...tipo,
        ejerciciosProblematicos: tipo.ejerciciosProblematicos.map((ej) => ({
          ...ej,
          ejercicioId: ej.ejercicioId.toString(),
          alternativasSugeridas: ej.alternativasSugeridas.map((alt) => ({
            ...alt,
            ejercicioId: alt.ejercicioId.toString(),
          })),
        })),
        // Serializar alternativas a nivel de tipo
        alternativasSugeridasDelTipo: tipo.alternativasSugeridasDelTipo.map((alt) => ({
          ...alt,
          ejercicioId: alt.ejercicioId.toString(),
        })),
      })),
      ejerciciosProblematicos: analisis.ejerciciosProblematicos.map((ej) => ({
        ...ej,
        ejercicioId: ej.ejercicioId.toString(),
        alternativasSugeridas: ej.alternativasSugeridas.map((alt) => ({
          ...alt,
          ejercicioId: alt.ejercicioId.toString(),
        })),
      })),
      patrones: analisis.patrones.map((p) => ({
        ...p,
        ejercicioAfectado: p.ejercicioAfectado
          ? { ...p.ejercicioAfectado, id: p.ejercicioAfectado.id.toString() }
          : undefined,
      })),
      requiereAtencion: analisis.requiereAtencion,
      prioridadAtencion: analisis.prioridadAtencion,
      // Recomendaciones generadas por las reglas
      recomendaciones: recomendaciones.map((r) => ({
        ...r,
        cambiosSugeridos: {
          reducir: r.cambiosSugeridos.reducir.map((c) => ({
            ...c,
            ejercicioId: c.ejercicioId.toString(),
          })),
          agregar: r.cambiosSugeridos.agregar.map((c) => ({
            ...c,
            ejercicioId: c.ejercicioId.toString(),
          })),
          modificar: r.cambiosSugeridos.modificar.map((c) => ({
            ...c,
            ejercicioId: c.ejercicioId.toString(),
          })),
        },
      })),
    };
  }

  // Obtener solo las recomendaciones de un atleta (version simplificada)
  // GET /api/algoritmo/analisis/:atletaId/recomendaciones
  @Get(':atletaId/recomendaciones')
  @Roles('COMITE_TECNICO', 'ENTRENADOR', 'ADMINISTRADOR')
  async obtenerRecomendaciones(
    @Param('atletaId', ParseIntPipe) atletaId: number,
    @Query('dias') dias?: string
  ) {
    const diasAnalisis = dias ? parseInt(dias, 10) : 30;
    const atletaIdBigInt = BigInt(atletaId);

    // Ejecutar analisis
    const analisis = await this.analisisService.analizarRendimientoAtleta(
      atletaIdBigInt,
      diasAnalisis
    );

    // Evaluar reglas
    const contexto: ContextoEvaluacion = {
      atletaId: atletaIdBigInt,
      nombreAtleta: analisis.nombreAtleta,
      rendimientoPorTipo: analisis.rendimientoPorTipo,
      ejerciciosProblematicos: analisis.ejerciciosProblematicos,
      diasAnalizados: analisis.periodoAnalisis.diasAnalizados,
    };

    const recomendaciones = evaluarReglas(contexto);

    return {
      atletaId: atletaId.toString(),
      nombreAtleta: analisis.nombreAtleta,
      requiereAtencion: analisis.requiereAtencion,
      prioridadAtencion: analisis.prioridadAtencion,
      cantidadRecomendaciones: recomendaciones.length,
      recomendaciones: recomendaciones.map((r) => ({
        tipoRecomendacion: r.tipoRecomendacion,
        prioridad: r.prioridad,
        titulo: r.titulo,
        mensaje: r.mensaje,
        accionSugerida: r.accionSugerida,
        cambiosSugeridos: {
          reducir: r.cambiosSugeridos.reducir.map((c) => ({
            ejercicioId: c.ejercicioId.toString(),
            nombre: c.nombre,
            razon: c.razon,
          })),
          agregar: r.cambiosSugeridos.agregar.map((c) => ({
            ejercicioId: c.ejercicioId.toString(),
            nombre: c.nombre,
            razon: c.razon,
          })),
          modificar: r.cambiosSugeridos.modificar.map((c) => ({
            ejercicioId: c.ejercicioId.toString(),
            cambio: c.cambio,
          })),
        },
      })),
    };
  }
}
