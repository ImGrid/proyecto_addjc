import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { PrismaService } from '../../../database/prisma.service';
import { CreateMacrocicloDto, UpdateMacrocicloDto, MacrocicloResponseDto } from '../dto';
import { EstadoMacrociclo } from '@prisma/client';

@Injectable()
export class MacrociclosService {
  constructor(private readonly prisma: PrismaService) {}

  // Crear un nuevo macrociclo
  @Transactional()
  async create(
    createMacrocicloDto: CreateMacrocicloDto,
    creadoPorUserId: string,
  ): Promise<MacrocicloResponseDto> {
    // Validar que fechaFin > fechaInicio
    const fechaInicio = new Date(createMacrocicloDto.fechaInicio);
    const fechaFin = new Date(createMacrocicloDto.fechaFin);

    if (fechaFin <= fechaInicio) {
      throw new BadRequestException('La fecha de fin debe ser posterior a la fecha de inicio');
    }

    // Crear macrociclo
    const macrociclo = await this.prisma.macrociclo.create({
      data: {
        nombre: createMacrocicloDto.nombre,
        temporada: createMacrocicloDto.temporada,
        equipo: createMacrocicloDto.equipo,
        categoriaObjetivo: createMacrocicloDto.categoriaObjetivo,
        objetivo1: createMacrocicloDto.objetivo1,
        objetivo2: createMacrocicloDto.objetivo2,
        objetivo3: createMacrocicloDto.objetivo3,
        fechaInicio,
        fechaFin,
        estado: createMacrocicloDto.estado || EstadoMacrociclo.PLANIFICADO,
        totalMicrociclos: createMacrocicloDto.totalMicrociclos || 0,
        totalSesiones: createMacrocicloDto.totalSesiones || 0,
        totalHoras: createMacrocicloDto.totalHoras || 0,
        creadoPor: BigInt(creadoPorUserId),
      },
      include: {
        creador: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
          },
        },
      },
    });

    return this.formatMacrocicloResponse(macrociclo);
  }

  // Listar todos los macrociclos con filtros y paginación
  async findAll(userId: bigint, rol: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const where: any = {};

    // Si es ENTRENADOR, usar nested filter de Prisma (5 queries → 1 query)
    if (rol === 'ENTRENADOR') {
      // Buscar entrenadorId desde usuarioId
      const entrenador = await this.prisma.entrenador.findUnique({
        where: { usuarioId: userId },
        select: { id: true },
      });

      if (!entrenador) {
        throw new NotFoundException('Entrenador no encontrado');
      }

      // Usar nested filter para filtrar macrociclos que tienen mesociclos con microciclos con atletas del entrenador
      where.mesociclos = {
        some: {
          microciclos: {
            some: {
              asignacionesAtletas: {
                some: {
                  atleta: {
                    entrenadorAsignadoId: entrenador.id,
                  },
                },
              },
            },
          },
        },
      };
    }

    // Si es ATLETA, usar nested filter de Prisma (4 queries → 1 query)
    if (rol === 'ATLETA') {
      // Buscar atletaId desde usuarioId
      const atleta = await this.prisma.atleta.findUnique({
        where: { usuarioId: userId },
        select: { id: true },
      });

      if (!atleta) {
        throw new NotFoundException('Atleta no encontrado');
      }

      // Usar nested filter para filtrar macrociclos que tienen mesociclos con microciclos asignados al atleta
      where.mesociclos = {
        some: {
          microciclos: {
            some: {
              asignacionesAtletas: {
                some: {
                  atletaId: atleta.id,
                },
              },
            },
          },
        },
      };
    }

    const [macrociclos, total] = await Promise.all([
      this.prisma.macrociclo.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          creador: {
            select: {
              id: true,
              nombreCompleto: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.macrociclo.count({ where }),
    ]);

    return {
      data: macrociclos.map((m) => this.formatMacrocicloResponse(m)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Obtener un macrociclo por ID (con validacion de ownership para ENTRENADOR)
  async findOne(
    id: string,
    userId: bigint,
    rol: string,
  ): Promise<MacrocicloResponseDto> {
    const macrociclo = await this.prisma.macrociclo.findUnique({
      where: { id: BigInt(id) },
      include: {
        creador: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
          },
        },
      },
    });

    if (!macrociclo) {
      throw new NotFoundException('Macrociclo no encontrado');
    }

    // Si es ENTRENADOR, validar usando nested filter (3 queries → 1 query)
    if (rol === 'ENTRENADOR') {
      // Buscar entrenadorId desde usuarioId
      const entrenador = await this.prisma.entrenador.findUnique({
        where: { usuarioId: userId },
        select: { id: true },
      });

      if (!entrenador) {
        throw new NotFoundException('Entrenador no encontrado');
      }

      // Validar que existe al menos una asignacion usando nested filter
      const asignacion = await this.prisma.asignacionAtletaMicrociclo.findFirst({
        where: {
          atleta: {
            entrenadorAsignadoId: entrenador.id,
          },
          microciclo: {
            mesociclo: {
              macrocicloId: macrociclo.id,
            },
          },
        },
      });

      if (!asignacion) {
        throw new NotFoundException('Macrociclo no encontrado o no autorizado');
      }
    }

    // Si es ATLETA, validar usando nested filter (ya optimizado)
    if (rol === 'ATLETA') {
      // Buscar atletaId desde usuarioId
      const atleta = await this.prisma.atleta.findUnique({
        where: { usuarioId: userId },
        select: { id: true },
      });

      if (!atleta) {
        throw new NotFoundException('Atleta no encontrado');
      }

      // Verificar si el atleta esta asignado a algun microciclo de este macrociclo
      const asignacion = await this.prisma.asignacionAtletaMicrociclo.findFirst({
        where: {
          atletaId: atleta.id,
          microciclo: {
            mesociclo: {
              macrocicloId: macrociclo.id,
            },
          },
        },
      });

      if (!asignacion) {
        throw new NotFoundException('Macrociclo no encontrado o no autorizado');
      }
    }

    return this.formatMacrocicloResponse(macrociclo);
  }

  // Actualizar un macrociclo
  @Transactional()
  async update(
    id: string,
    updateMacrocicloDto: UpdateMacrocicloDto,
  ): Promise<MacrocicloResponseDto> {
    // Verificar que existe
    const existingMacrociclo = await this.prisma.macrociclo.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existingMacrociclo) {
      throw new NotFoundException('Macrociclo no encontrado');
    }

    // Validar fechas si se actualizan
    if (updateMacrocicloDto.fechaInicio || updateMacrocicloDto.fechaFin) {
      const fechaInicio = updateMacrocicloDto.fechaInicio
        ? new Date(updateMacrocicloDto.fechaInicio)
        : existingMacrociclo.fechaInicio;

      const fechaFin = updateMacrocicloDto.fechaFin
        ? new Date(updateMacrocicloDto.fechaFin)
        : existingMacrociclo.fechaFin;

      if (fechaFin <= fechaInicio) {
        throw new BadRequestException('La fecha de fin debe ser posterior a la fecha de inicio');
      }
    }

    // Actualizar
    const macrociclo = await this.prisma.macrociclo.update({
      where: { id: BigInt(id) },
      data: {
        ...(updateMacrocicloDto.nombre && { nombre: updateMacrocicloDto.nombre }),
        ...(updateMacrocicloDto.temporada && { temporada: updateMacrocicloDto.temporada }),
        ...(updateMacrocicloDto.equipo && { equipo: updateMacrocicloDto.equipo }),
        ...(updateMacrocicloDto.categoriaObjetivo && { categoriaObjetivo: updateMacrocicloDto.categoriaObjetivo }),
        ...(updateMacrocicloDto.objetivo1 && { objetivo1: updateMacrocicloDto.objetivo1 }),
        ...(updateMacrocicloDto.objetivo2 && { objetivo2: updateMacrocicloDto.objetivo2 }),
        ...(updateMacrocicloDto.objetivo3 && { objetivo3: updateMacrocicloDto.objetivo3 }),
        ...(updateMacrocicloDto.fechaInicio && { fechaInicio: new Date(updateMacrocicloDto.fechaInicio) }),
        ...(updateMacrocicloDto.fechaFin && { fechaFin: new Date(updateMacrocicloDto.fechaFin) }),
        ...(updateMacrocicloDto.estado && { estado: updateMacrocicloDto.estado }),
        ...(updateMacrocicloDto.totalMicrociclos !== undefined && { totalMicrociclos: updateMacrocicloDto.totalMicrociclos }),
        ...(updateMacrocicloDto.totalSesiones !== undefined && { totalSesiones: updateMacrocicloDto.totalSesiones }),
        ...(updateMacrocicloDto.totalHoras !== undefined && { totalHoras: updateMacrocicloDto.totalHoras }),
      },
      include: {
        creador: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
          },
        },
      },
    });

    return this.formatMacrocicloResponse(macrociclo);
  }

  // Eliminar un macrociclo (hard delete)
  @Transactional()
  async remove(id: string): Promise<{ message: string }> {
    const macrociclo = await this.prisma.macrociclo.findUnique({
      where: { id: BigInt(id) },
      include: {
        mesociclos: true,
      },
    });

    if (!macrociclo) {
      throw new NotFoundException('Macrociclo no encontrado');
    }

    // Verificar si tiene mesociclos asociados
    if (macrociclo.mesociclos.length > 0) {
      throw new BadRequestException(
        `No se puede eliminar el macrociclo porque tiene ${macrociclo.mesociclos.length} mesociclo(s) asociado(s)`
      );
    }

    // Eliminar
    await this.prisma.macrociclo.delete({
      where: { id: BigInt(id) },
    });

    return { message: 'Macrociclo eliminado permanentemente' };
  }

  // Método auxiliar para formatear respuesta
  private formatMacrocicloResponse(macrociclo: any): MacrocicloResponseDto {
    return {
      id: macrociclo.id.toString(),
      nombre: macrociclo.nombre,
      temporada: macrociclo.temporada,
      equipo: macrociclo.equipo,
      categoriaObjetivo: macrociclo.categoriaObjetivo,
      objetivo1: macrociclo.objetivo1,
      objetivo2: macrociclo.objetivo2,
      objetivo3: macrociclo.objetivo3,
      fechaInicio: macrociclo.fechaInicio,
      fechaFin: macrociclo.fechaFin,
      estado: macrociclo.estado,
      totalMicrociclos: macrociclo.totalMicrociclos,
      totalSesiones: macrociclo.totalSesiones,
      totalHoras: parseFloat(macrociclo.totalHoras.toString()),
      creadoPor: macrociclo.creadoPor.toString(),
      createdAt: macrociclo.createdAt,
      updatedAt: macrociclo.updatedAt,
      ...(macrociclo.creador && {
        creador: {
          id: macrociclo.creador.id.toString(),
          nombreCompleto: macrociclo.creador.nombreCompleto,
          email: macrociclo.creador.email,
        },
      }),
    };
  }
}
