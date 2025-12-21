import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { PrismaService } from '../../../database/prisma.service';
import { AccessControlService } from '../../../common/services/access-control.service';
import { CreateMicrocicloDto, UpdateMicrocicloDto, MicrocicloResponseDto } from '../dto';
import { DateRangeValidator } from '../validators/date-range.validator';
import { SesionFactory } from './sesion.factory';
import { Prisma } from '@prisma/client';

@Injectable()
export class MicrociclosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessControl: AccessControlService,
    private readonly dateRangeValidator: DateRangeValidator,
    private readonly sesionFactory: SesionFactory,
  ) {}

  // Crear un nuevo microciclo (Aggregate Root)
  // Genera automáticamente 7 sesiones usando el Factory
  @Transactional()
  async create(createMicrocicloDto: CreateMicrocicloDto): Promise<MicrocicloResponseDto> {
    const fechaInicio = new Date(createMicrocicloDto.fechaInicio);
    const fechaFin = new Date(createMicrocicloDto.fechaFin);

    // Validar que fechaFin > fechaInicio
    this.dateRangeValidator.validateDateOrder(fechaInicio, fechaFin, 'microciclo');

    // Validar que el rango es exactamente 7 días
    const diffTime = Math.abs(fechaFin.getTime() - fechaInicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays !== 6) {
      throw new BadRequestException(
        'Un microciclo debe durar exactamente 7 días (fechaFin debe ser fechaInicio + 6 días)'
      );
    }

    // Si hay mesocicloId, validar fechas jerárquicas
    if (createMicrocicloDto.mesocicloId) {
      const mesocicloId = BigInt(createMicrocicloDto.mesocicloId);
      await this.dateRangeValidator.validateMicrocicloInMesociclo(
        mesocicloId,
        fechaInicio,
        fechaFin,
      );
    }

    // Crear microciclo
    const microciclo = await this.prisma.microciclo.create({
      data: {
        mesocicloId: createMicrocicloDto.mesocicloId ? BigInt(createMicrocicloDto.mesocicloId) : null,
        numeroMicrociclo: createMicrocicloDto.numeroMicrociclo,
        numeroGlobalMicrociclo: createMicrocicloDto.numeroGlobalMicrociclo,
        fechaInicio,
        fechaFin,
        tipoMicrociclo: createMicrocicloDto.tipoMicrociclo,
        volumenTotal: new Prisma.Decimal(createMicrocicloDto.volumenTotal),
        intensidadPromedio: new Prisma.Decimal(createMicrocicloDto.intensidadPromedio),
        objetivoSemanal: createMicrocicloDto.objetivoSemanal,
        observaciones: createMicrocicloDto.observaciones,
        creadoPor: createMicrocicloDto.creadoPor || 'COMITE_TECNICO',
        mediaVolumen: createMicrocicloDto.mediaVolumen ? new Prisma.Decimal(createMicrocicloDto.mediaVolumen) : null,
        mediaIntensidad: createMicrocicloDto.mediaIntensidad ? new Prisma.Decimal(createMicrocicloDto.mediaIntensidad) : null,
        sentidoVolumen: createMicrocicloDto.sentidoVolumen,
        sentidoIntensidad: createMicrocicloDto.sentidoIntensidad,
        vCarga1: createMicrocicloDto.vCarga1 ? new Prisma.Decimal(createMicrocicloDto.vCarga1) : null,
        vCarga1Nivel: createMicrocicloDto.vCarga1Nivel,
        iCarga1: createMicrocicloDto.iCarga1 ? new Prisma.Decimal(createMicrocicloDto.iCarga1) : null,
        iCarga1Nivel: createMicrocicloDto.iCarga1Nivel,
        vCarga2: createMicrocicloDto.vCarga2 ? new Prisma.Decimal(createMicrocicloDto.vCarga2) : null,
        vCarga2Nivel: createMicrocicloDto.vCarga2Nivel,
        iCarga2: createMicrocicloDto.iCarga2 ? new Prisma.Decimal(createMicrocicloDto.iCarga2) : null,
        iCarga2Nivel: createMicrocicloDto.iCarga2Nivel,
      },
      include: {
        mesociclo: {
          select: {
            id: true,
            nombre: true,
            etapa: true,
          },
        },
      },
    });

    // Generar 7 sesiones automáticamente usando el Factory
    const sessionTemplates = this.sesionFactory.generateWeeklySessions(
      fechaInicio,
      createMicrocicloDto.objetivoSemanal,
    );

    // Crear las 7 sesiones en batch
    await this.prisma.sesion.createMany({
      data: sessionTemplates.map((template) => ({
        microcicloId: microciclo.id,
        fecha: template.fecha,
        diaSemana: template.diaSemana,
        numeroSesion: template.numeroSesion,
        tipoSesion: template.tipoSesion,
        turno: template.turno,
        tipoPlanificacion: template.tipoPlanificacion,
        creadoPor: template.creadoPor,
        duracionPlanificada: template.duracionPlanificada,
        volumenPlanificado: template.volumenPlanificado,
        intensidadPlanificada: template.intensidadPlanificada,
        relacionVI: template.relacionVI,
        contenidoFisico: template.contenidoFisico,
        contenidoTecnico: template.contenidoTecnico,
        contenidoTactico: template.contenidoTactico,
      })),
    });

    // Obtener el microciclo con sus sesiones creadas
    const microcicloConSesiones = await this.prisma.microciclo.findUnique({
      where: { id: microciclo.id },
      include: {
        mesociclo: {
          select: {
            id: true,
            nombre: true,
            etapa: true,
          },
        },
        sesiones: {
          select: {
            id: true,
            fecha: true,
            diaSemana: true,
            tipoSesion: true,
          },
          orderBy: { numeroSesion: 'asc' },
        },
      },
    });

    return this.formatMicrocicloResponse(microcicloConSesiones!);
  }

  // Listar microciclos con filtros opcionales
  async findAll(
    userId: bigint,
    rol: string,
    mesocicloId?: string,
    page = 1,
    limit = 10,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (mesocicloId) {
      where.mesocicloId = BigInt(mesocicloId);
    }

    // Si es ENTRENADOR, usar nested filter de Prisma (3 queries → 1 query)
    if (rol === 'ENTRENADOR') {
      const entrenadorId = await this.accessControl.getEntrenadorId(userId);

      if (!entrenadorId) {
        throw new NotFoundException('Entrenador no encontrado');
      }

      // Usar nested filter para filtrar microciclos que tienen atletas del entrenador
      where.asignacionesAtletas = {
        some: {
          atleta: {
            entrenadorAsignadoId: entrenadorId,
          },
        },
      };
    }

    // Si es ATLETA, usar nested filter de Prisma
    if (rol === 'ATLETA') {
      const atletaId = await this.accessControl.getAtletaId(userId);

      if (!atletaId) {
        throw new NotFoundException('No se encontro el perfil de atleta para este usuario');
      }

      // Filtrar microciclos asignados al atleta
      where.asignacionesAtletas = {
        some: {
          atletaId: atletaId,
          activa: true,
        },
      };
    }

    const [microciclos, total] = await Promise.all([
      this.prisma.microciclo.findMany({
        where,
        skip,
        take: limit,
        orderBy: { numeroGlobalMicrociclo: 'asc' },
        include: {
          mesociclo: {
            select: {
              id: true,
              nombre: true,
              etapa: true,
            },
          },
          sesiones: {
            select: {
              id: true,
              fecha: true,
              diaSemana: true,
              tipoSesion: true,
            },
            orderBy: { numeroSesion: 'asc' },
          },
        },
      }),
      this.prisma.microciclo.count({ where }),
    ]);

    return {
      data: microciclos.map((m) => this.formatMicrocicloResponse(m)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Obtener un microciclo por ID (con validacion de ownership para ENTRENADOR)
  async findOne(
    id: string,
    userId: bigint,
    rol: string,
  ): Promise<MicrocicloResponseDto> {
    const microciclo = await this.prisma.microciclo.findUnique({
      where: { id: BigInt(id) },
      include: {
        mesociclo: {
          select: {
            id: true,
            nombre: true,
            etapa: true,
          },
        },
        sesiones: {
          select: {
            id: true,
            fecha: true,
            diaSemana: true,
            tipoSesion: true,
          },
          orderBy: { numeroSesion: 'asc' },
        },
      },
    });

    if (!microciclo) {
      throw new NotFoundException('Microciclo no encontrado');
    }

    // Si es ENTRENADOR, validar usando nested filter (3 queries → 1 query)
    if (rol === 'ENTRENADOR') {
      const entrenadorId = await this.accessControl.getEntrenadorId(userId);

      if (!entrenadorId) {
        throw new NotFoundException('Entrenador no encontrado');
      }

      // Validar que existe al menos una asignacion usando nested filter
      const asignacion = await this.prisma.asignacionAtletaMicrociclo.findFirst({
        where: {
          microcicloId: microciclo.id,
          atleta: {
            entrenadorAsignadoId: entrenadorId,
          },
        },
      });

      if (!asignacion) {
        throw new NotFoundException('Microciclo no encontrado o no autorizado');
      }
    }

    // Si es ATLETA, validar que esta asignado a este microciclo
    if (rol === 'ATLETA') {
      const atletaId = await this.accessControl.getAtletaId(userId);

      if (!atletaId) {
        throw new NotFoundException('No se encontro el perfil de atleta para este usuario');
      }

      const asignacion = await this.prisma.asignacionAtletaMicrociclo.findFirst({
        where: {
          microcicloId: microciclo.id,
          atletaId: atletaId,
          activa: true,
        },
      });

      if (!asignacion) {
        throw new ForbiddenException('No tienes permiso para ver este microciclo');
      }
    }

    return this.formatMicrocicloResponse(microciclo);
  }

  // Actualizar un microciclo
  @Transactional()
  async update(
    id: string,
    updateMicrocicloDto: UpdateMicrocicloDto,
  ): Promise<MicrocicloResponseDto> {
    const existingMicrociclo = await this.prisma.microciclo.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existingMicrociclo) {
      throw new NotFoundException('Microciclo no encontrado');
    }

    // Validar fechas si se actualizan
    if (updateMicrocicloDto.fechaInicio || updateMicrocicloDto.fechaFin) {
      const fechaInicio = updateMicrocicloDto.fechaInicio
        ? new Date(updateMicrocicloDto.fechaInicio)
        : existingMicrociclo.fechaInicio;

      const fechaFin = updateMicrocicloDto.fechaFin
        ? new Date(updateMicrocicloDto.fechaFin)
        : existingMicrociclo.fechaFin;

      this.dateRangeValidator.validateDateOrder(fechaInicio, fechaFin, 'microciclo');

      // Validar que sigue siendo 7 días
      const diffTime = Math.abs(fechaFin.getTime() - fechaInicio.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays !== 6) {
        throw new BadRequestException('Un microciclo debe durar exactamente 7 días');
      }

      // Si hay mesociclo, validar fechas jerárquicas
      if (existingMicrociclo.mesocicloId) {
        await this.dateRangeValidator.validateMicrocicloInMesociclo(
          existingMicrociclo.mesocicloId,
          fechaInicio,
          fechaFin,
        );
      }
    }

    // Actualizar
    const microciclo = await this.prisma.microciclo.update({
      where: { id: BigInt(id) },
      data: {
        ...(updateMicrocicloDto.numeroMicrociclo && { numeroMicrociclo: updateMicrocicloDto.numeroMicrociclo }),
        ...(updateMicrocicloDto.numeroGlobalMicrociclo && { numeroGlobalMicrociclo: updateMicrocicloDto.numeroGlobalMicrociclo }),
        ...(updateMicrocicloDto.fechaInicio && { fechaInicio: new Date(updateMicrocicloDto.fechaInicio) }),
        ...(updateMicrocicloDto.fechaFin && { fechaFin: new Date(updateMicrocicloDto.fechaFin) }),
        ...(updateMicrocicloDto.tipoMicrociclo && { tipoMicrociclo: updateMicrocicloDto.tipoMicrociclo }),
        ...(updateMicrocicloDto.volumenTotal !== undefined && { volumenTotal: new Prisma.Decimal(updateMicrocicloDto.volumenTotal) }),
        ...(updateMicrocicloDto.intensidadPromedio !== undefined && { intensidadPromedio: new Prisma.Decimal(updateMicrocicloDto.intensidadPromedio) }),
        ...(updateMicrocicloDto.objetivoSemanal && { objetivoSemanal: updateMicrocicloDto.objetivoSemanal }),
        ...(updateMicrocicloDto.observaciones !== undefined && { observaciones: updateMicrocicloDto.observaciones }),
        ...(updateMicrocicloDto.creadoPor && { creadoPor: updateMicrocicloDto.creadoPor }),
        ...(updateMicrocicloDto.mediaVolumen !== undefined && { mediaVolumen: updateMicrocicloDto.mediaVolumen ? new Prisma.Decimal(updateMicrocicloDto.mediaVolumen) : null }),
        ...(updateMicrocicloDto.mediaIntensidad !== undefined && { mediaIntensidad: updateMicrocicloDto.mediaIntensidad ? new Prisma.Decimal(updateMicrocicloDto.mediaIntensidad) : null }),
        ...(updateMicrocicloDto.sentidoVolumen !== undefined && { sentidoVolumen: updateMicrocicloDto.sentidoVolumen }),
        ...(updateMicrocicloDto.sentidoIntensidad !== undefined && { sentidoIntensidad: updateMicrocicloDto.sentidoIntensidad }),
        ...(updateMicrocicloDto.vCarga1 !== undefined && { vCarga1: updateMicrocicloDto.vCarga1 ? new Prisma.Decimal(updateMicrocicloDto.vCarga1) : null }),
        ...(updateMicrocicloDto.vCarga1Nivel !== undefined && { vCarga1Nivel: updateMicrocicloDto.vCarga1Nivel }),
        ...(updateMicrocicloDto.iCarga1 !== undefined && { iCarga1: updateMicrocicloDto.iCarga1 ? new Prisma.Decimal(updateMicrocicloDto.iCarga1) : null }),
        ...(updateMicrocicloDto.iCarga1Nivel !== undefined && { iCarga1Nivel: updateMicrocicloDto.iCarga1Nivel }),
        ...(updateMicrocicloDto.vCarga2 !== undefined && { vCarga2: updateMicrocicloDto.vCarga2 ? new Prisma.Decimal(updateMicrocicloDto.vCarga2) : null }),
        ...(updateMicrocicloDto.vCarga2Nivel !== undefined && { vCarga2Nivel: updateMicrocicloDto.vCarga2Nivel }),
        ...(updateMicrocicloDto.iCarga2 !== undefined && { iCarga2: updateMicrocicloDto.iCarga2 ? new Prisma.Decimal(updateMicrocicloDto.iCarga2) : null }),
        ...(updateMicrocicloDto.iCarga2Nivel !== undefined && { iCarga2Nivel: updateMicrocicloDto.iCarga2Nivel }),
      },
      include: {
        mesociclo: {
          select: {
            id: true,
            nombre: true,
            etapa: true,
          },
        },
        sesiones: {
          select: {
            id: true,
            fecha: true,
            diaSemana: true,
            tipoSesion: true,
          },
          orderBy: { numeroSesion: 'asc' },
        },
      },
    });

    return this.formatMicrocicloResponse(microciclo);
  }

  // Eliminar un microciclo
  // Las sesiones se eliminan automáticamente por onDelete: Cascade
  @Transactional()
  async remove(id: string): Promise<{ message: string }> {
    const microciclo = await this.prisma.microciclo.findUnique({
      where: { id: BigInt(id) },
      include: {
        sesiones: true,
      },
    });

    if (!microciclo) {
      throw new NotFoundException('Microciclo no encontrado');
    }

    // Eliminar (las sesiones se eliminan en cascada)
    await this.prisma.microciclo.delete({
      where: { id: BigInt(id) },
    });

    return {
      message: `Microciclo y sus ${microciclo.sesiones.length} sesiones eliminados permanentemente`,
    };
  }

  // Método auxiliar para formatear respuesta
  private formatMicrocicloResponse(microciclo: any): MicrocicloResponseDto {
    return {
      id: microciclo.id.toString(),
      mesocicloId: microciclo.mesocicloId ? microciclo.mesocicloId.toString() : null,
      numeroMicrociclo: microciclo.numeroMicrociclo,
      numeroGlobalMicrociclo: microciclo.numeroGlobalMicrociclo,
      fechaInicio: microciclo.fechaInicio,
      fechaFin: microciclo.fechaFin,
      tipoMicrociclo: microciclo.tipoMicrociclo,
      volumenTotal: parseFloat(microciclo.volumenTotal.toString()),
      intensidadPromedio: parseFloat(microciclo.intensidadPromedio.toString()),
      objetivoSemanal: microciclo.objetivoSemanal,
      observaciones: microciclo.observaciones,
      creadoPor: microciclo.creadoPor,
      mediaVolumen: microciclo.mediaVolumen ? parseFloat(microciclo.mediaVolumen.toString()) : null,
      mediaIntensidad: microciclo.mediaIntensidad ? parseFloat(microciclo.mediaIntensidad.toString()) : null,
      sentidoVolumen: microciclo.sentidoVolumen,
      sentidoIntensidad: microciclo.sentidoIntensidad,
      vCarga1: microciclo.vCarga1 ? parseFloat(microciclo.vCarga1.toString()) : null,
      vCarga1Nivel: microciclo.vCarga1Nivel,
      iCarga1: microciclo.iCarga1 ? parseFloat(microciclo.iCarga1.toString()) : null,
      iCarga1Nivel: microciclo.iCarga1Nivel,
      vCarga2: microciclo.vCarga2 ? parseFloat(microciclo.vCarga2.toString()) : null,
      vCarga2Nivel: microciclo.vCarga2Nivel,
      iCarga2: microciclo.iCarga2 ? parseFloat(microciclo.iCarga2.toString()) : null,
      iCarga2Nivel: microciclo.iCarga2Nivel,
      createdAt: microciclo.createdAt,
      updatedAt: microciclo.updatedAt,
      ...(microciclo.mesociclo && {
        mesociclo: {
          id: microciclo.mesociclo.id.toString(),
          nombre: microciclo.mesociclo.nombre,
          etapa: microciclo.mesociclo.etapa,
        },
      }),
      ...(microciclo.sesiones && {
        sesiones: microciclo.sesiones.map((s: any) => ({
          id: s.id.toString(),
          fecha: s.fecha,
          diaSemana: s.diaSemana,
          tipoSesion: s.tipoSesion,
        })),
      }),
    };
  }
}
