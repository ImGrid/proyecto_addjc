import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { PrismaService } from '../../../database/prisma.service';
import { TipoEjercicio } from '@prisma/client';

// Controlador para exponer el catalogo de ejercicios al frontend
// Usado para el selector de ejercicios en la edicion de sesiones
@Controller('catalogo-ejercicios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CatalogoEjerciciosController {
  constructor(private readonly prisma: PrismaService) {}

  // GET /api/catalogo-ejercicios - Listar ejercicios del catalogo
  // Query params:
  //   - tipo: Filtrar por tipo (FISICO, TECNICO_TACHI, TECNICO_NE, RESISTENCIA, VELOCIDAD)
  //   - activo: Filtrar por estado activo (default: true)
  //   - search: Buscar por nombre (parcial, case insensitive)
  @Get()
  @Roles('COMITE_TECNICO', 'ENTRENADOR')
  async findAll(
    @Query('tipo') tipo?: TipoEjercicio,
    @Query('activo') activo?: string,
    @Query('search') search?: string
  ) {
    // Construir filtros
    const where: any = {};

    // Filtro por tipo
    if (tipo) {
      where.tipo = tipo;
    }

    // Filtro por activo (default: true)
    const activoBoolean = activo === 'false' ? false : true;
    where.activo = activoBoolean;

    // Filtro por busqueda de nombre
    if (search && search.trim()) {
      where.nombre = {
        contains: search.trim(),
        mode: 'insensitive',
      };
    }

    // Consultar ejercicios
    const ejercicios = await this.prisma.catalogoEjercicios.findMany({
      where,
      select: {
        id: true,
        nombre: true,
        tipo: true,
        subtipo: true,
        categoria: true,
        descripcion: true,
        duracionMinutos: true,
        nivelDificultad: true,
      },
      orderBy: [{ tipo: 'asc' }, { nombre: 'asc' }],
    });

    // Formatear respuesta (convertir BigInt a string)
    const data = ejercicios.map((ej) => ({
      id: ej.id.toString(),
      nombre: ej.nombre,
      tipo: ej.tipo,
      subtipo: ej.subtipo,
      categoria: ej.categoria,
      descripcion: ej.descripcion,
      duracionMinutos: ej.duracionMinutos,
      nivelDificultad: ej.nivelDificultad,
    }));

    return {
      data,
      meta: {
        total: data.length,
        filtros: {
          tipo: tipo || null,
          activo: activoBoolean,
          search: search || null,
        },
      },
    };
  }

  // GET /api/catalogo-ejercicios/por-tipo - Listar ejercicios agrupados por tipo
  // Util para el frontend cuando necesita mostrar selectores por categoria
  @Get('por-tipo')
  @Roles('COMITE_TECNICO', 'ENTRENADOR')
  async findAllGroupedByType() {
    const ejercicios = await this.prisma.catalogoEjercicios.findMany({
      where: { activo: true },
      select: {
        id: true,
        nombre: true,
        tipo: true,
        subtipo: true,
        categoria: true,
      },
      orderBy: [{ tipo: 'asc' }, { nombre: 'asc' }],
    });

    // Agrupar por tipo
    const agrupados: Record<
      string,
      Array<{
        id: string;
        nombre: string;
        subtipo: string | null;
        categoria: string | null;
      }>
    > = {
      FISICO: [],
      TECNICO_TACHI: [],
      TECNICO_NE: [],
      RESISTENCIA: [],
      VELOCIDAD: [],
    };

    for (const ej of ejercicios) {
      agrupados[ej.tipo].push({
        id: ej.id.toString(),
        nombre: ej.nombre,
        subtipo: ej.subtipo,
        categoria: ej.categoria,
      });
    }

    return {
      data: agrupados,
      meta: {
        totales: {
          FISICO: agrupados.FISICO.length,
          TECNICO_TACHI: agrupados.TECNICO_TACHI.length,
          TECNICO_NE: agrupados.TECNICO_NE.length,
          RESISTENCIA: agrupados.RESISTENCIA.length,
          VELOCIDAD: agrupados.VELOCIDAD.length,
        },
      },
    };
  }
}
