import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { PrismaService } from '../../../database/prisma.service';
import { CreateMesocicloDto, UpdateMesocicloDto, MesocicloResponseDto } from '../dto';
import { DateRangeValidator } from '../validators/date-range.validator';

@Injectable()
export class MesociclosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dateRangeValidator: DateRangeValidator,
  ) {}

  // Crear un nuevo mesociclo
  @Transactional()
  async create(createMesocicloDto: CreateMesocicloDto): Promise<MesocicloResponseDto> {
    const fechaInicio = new Date(createMesocicloDto.fechaInicio);
    const fechaFin = new Date(createMesocicloDto.fechaFin);

    // Validar que fechaFin > fechaInicio
    this.dateRangeValidator.validateDateOrder(fechaInicio, fechaFin, 'mesociclo');

    const macrocicloId = BigInt(createMesocicloDto.macrocicloId);

    // Validar que las fechas del mesociclo estén dentro del rango del macrociclo
    await this.dateRangeValidator.validateMesocicloInMacrociclo(
      macrocicloId,
      fechaInicio,
      fechaFin,
    );

    // Crear mesociclo
    const mesociclo = await this.prisma.mesociclo.create({
      data: {
        macrocicloId,
        nombre: createMesocicloDto.nombre,
        numeroMesociclo: createMesocicloDto.numeroMesociclo,
        etapa: createMesocicloDto.etapa,
        fechaInicio,
        fechaFin,
        objetivoFisico: createMesocicloDto.objetivoFisico,
        objetivoTecnico: createMesocicloDto.objetivoTecnico,
        objetivoTactico: createMesocicloDto.objetivoTactico,
        totalMicrociclos: createMesocicloDto.totalMicrociclos || 0,
      },
      include: {
        macrociclo: {
          select: {
            id: true,
            nombre: true,
            temporada: true,
          },
        },
      },
    });

    return this.formatMesocicloResponse(mesociclo);
  }

  // Listar mesociclos con filtros opcionales
  async findAll(
    userId: bigint,
    rol: string,
    macrocicloId?: string,
    page = 1,
    limit = 10,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (macrocicloId) {
      where.macrocicloId = BigInt(macrocicloId);
    }

    // Si es ENTRENADOR, usar nested filter de Prisma (4 queries → 1 query)
    if (rol === 'ENTRENADOR') {
      // Buscar entrenadorId desde usuarioId
      const entrenador = await this.prisma.entrenador.findUnique({
        where: { usuarioId: userId },
        select: { id: true },
      });

      if (!entrenador) {
        throw new NotFoundException('Entrenador no encontrado');
      }

      // Usar nested filter para filtrar mesociclos que tienen microciclos con atletas del entrenador
      where.microciclos = {
        some: {
          asignacionesAtletas: {
            some: {
              atleta: {
                entrenadorAsignadoId: entrenador.id,
              },
            },
          },
        },
      };
    }

    // Si es ATLETA, usar nested filter de Prisma (3 queries → 1 query)
    if (rol === 'ATLETA') {
      // Buscar atletaId desde usuarioId
      const atleta = await this.prisma.atleta.findUnique({
        where: { usuarioId: userId },
        select: { id: true },
      });

      if (!atleta) {
        throw new NotFoundException('Atleta no encontrado');
      }

      // Usar nested filter para filtrar mesociclos que tienen microciclos asignados al atleta
      where.microciclos = {
        some: {
          asignacionesAtletas: {
            some: {
              atletaId: atleta.id,
            },
          },
        },
      };
    }

    const [mesociclos, total] = await Promise.all([
      this.prisma.mesociclo.findMany({
        where,
        skip,
        take: limit,
        orderBy: { numeroMesociclo: 'asc' },
        include: {
          macrociclo: {
            select: {
              id: true,
              nombre: true,
              temporada: true,
            },
          },
        },
      }),
      this.prisma.mesociclo.count({ where }),
    ]);

    return {
      data: mesociclos.map((m) => this.formatMesocicloResponse(m)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Obtener un mesociclo por ID (con validacion de ownership para ENTRENADOR)
  async findOne(
    id: string,
    userId: bigint,
    rol: string,
  ): Promise<MesocicloResponseDto> {
    const mesociclo = await this.prisma.mesociclo.findUnique({
      where: { id: BigInt(id) },
      include: {
        macrociclo: {
          select: {
            id: true,
            nombre: true,
            temporada: true,
          },
        },
      },
    });

    if (!mesociclo) {
      throw new NotFoundException('Mesociclo no encontrado');
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
            mesocicloId: mesociclo.id,
          },
        },
      });

      if (!asignacion) {
        throw new NotFoundException('Mesociclo no encontrado o no autorizado');
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

      // Verificar si el atleta esta asignado a algun microciclo de este mesociclo
      const asignacion = await this.prisma.asignacionAtletaMicrociclo.findFirst({
        where: {
          atletaId: atleta.id,
          microciclo: {
            mesocicloId: mesociclo.id,
          },
        },
      });

      if (!asignacion) {
        throw new NotFoundException('Mesociclo no encontrado o no autorizado');
      }
    }

    return this.formatMesocicloResponse(mesociclo);
  }

  // Actualizar un mesociclo
  @Transactional()
  async update(
    id: string,
    updateMesocicloDto: UpdateMesocicloDto,
  ): Promise<MesocicloResponseDto> {
    // Verificar que existe
    const existingMesociclo = await this.prisma.mesociclo.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existingMesociclo) {
      throw new NotFoundException('Mesociclo no encontrado');
    }

    // Validar fechas si se actualizan
    if (updateMesocicloDto.fechaInicio || updateMesocicloDto.fechaFin) {
      const fechaInicio = updateMesocicloDto.fechaInicio
        ? new Date(updateMesocicloDto.fechaInicio)
        : existingMesociclo.fechaInicio;

      const fechaFin = updateMesocicloDto.fechaFin
        ? new Date(updateMesocicloDto.fechaFin)
        : existingMesociclo.fechaFin;

      // Validar que fechaFin > fechaInicio
      this.dateRangeValidator.validateDateOrder(fechaInicio, fechaFin, 'mesociclo');

      // Validar que las fechas están dentro del rango del macrociclo
      await this.dateRangeValidator.validateMesocicloInMacrociclo(
        existingMesociclo.macrocicloId,
        fechaInicio,
        fechaFin,
      );
    }

    // Actualizar
    const mesociclo = await this.prisma.mesociclo.update({
      where: { id: BigInt(id) },
      data: {
        ...(updateMesocicloDto.nombre && { nombre: updateMesocicloDto.nombre }),
        ...(updateMesocicloDto.numeroMesociclo && { numeroMesociclo: updateMesocicloDto.numeroMesociclo }),
        ...(updateMesocicloDto.etapa && { etapa: updateMesocicloDto.etapa }),
        ...(updateMesocicloDto.fechaInicio && { fechaInicio: new Date(updateMesocicloDto.fechaInicio) }),
        ...(updateMesocicloDto.fechaFin && { fechaFin: new Date(updateMesocicloDto.fechaFin) }),
        ...(updateMesocicloDto.objetivoFisico && { objetivoFisico: updateMesocicloDto.objetivoFisico }),
        ...(updateMesocicloDto.objetivoTecnico && { objetivoTecnico: updateMesocicloDto.objetivoTecnico }),
        ...(updateMesocicloDto.objetivoTactico && { objetivoTactico: updateMesocicloDto.objetivoTactico }),
        ...(updateMesocicloDto.totalMicrociclos !== undefined && { totalMicrociclos: updateMesocicloDto.totalMicrociclos }),
      },
      include: {
        macrociclo: {
          select: {
            id: true,
            nombre: true,
            temporada: true,
          },
        },
      },
    });

    return this.formatMesocicloResponse(mesociclo);
  }

  // Eliminar un mesociclo
  @Transactional()
  async remove(id: string): Promise<{ message: string }> {
    const mesociclo = await this.prisma.mesociclo.findUnique({
      where: { id: BigInt(id) },
      include: {
        microciclos: true,
      },
    });

    if (!mesociclo) {
      throw new NotFoundException('Mesociclo no encontrado');
    }

    // Verificar si tiene microciclos asociados
    if (mesociclo.microciclos.length > 0) {
      throw new BadRequestException(
        `No se puede eliminar el mesociclo porque tiene ${mesociclo.microciclos.length} microciclo(s) asociado(s)`
      );
    }

    // Eliminar
    await this.prisma.mesociclo.delete({
      where: { id: BigInt(id) },
    });

    return { message: 'Mesociclo eliminado permanentemente' };
  }

  // Método auxiliar para formatear respuesta
  private formatMesocicloResponse(mesociclo: any): MesocicloResponseDto {
    return {
      id: mesociclo.id.toString(),
      macrocicloId: mesociclo.macrocicloId.toString(),
      nombre: mesociclo.nombre,
      numeroMesociclo: mesociclo.numeroMesociclo,
      etapa: mesociclo.etapa,
      fechaInicio: mesociclo.fechaInicio,
      fechaFin: mesociclo.fechaFin,
      objetivoFisico: mesociclo.objetivoFisico,
      objetivoTecnico: mesociclo.objetivoTecnico,
      objetivoTactico: mesociclo.objetivoTactico,
      totalMicrociclos: mesociclo.totalMicrociclos,
      createdAt: mesociclo.createdAt,
      updatedAt: mesociclo.updatedAt,
      ...(mesociclo.macrociclo && {
        macrociclo: {
          id: mesociclo.macrociclo.id.toString(),
          nombre: mesociclo.macrociclo.nombre,
          temporada: mesociclo.macrociclo.temporada,
        },
      }),
    };
  }
}
