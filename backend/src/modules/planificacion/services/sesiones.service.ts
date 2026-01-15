import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { PrismaService } from '../../../database/prisma.service';
import { AccessControlService } from '../../../common/services/access-control.service';
import { CreateSesionDto, UpdateSesionDto, SesionResponseDto } from '../dto';

@Injectable()
export class SesionesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessControl: AccessControlService
  ) {}

  // Crear una sesión individual
  @Transactional()
  async create(createSesionDto: CreateSesionDto): Promise<SesionResponseDto> {
    const microcicloId = BigInt(createSesionDto.microcicloId);

    // Verificar que el microciclo existe
    const microciclo = await this.prisma.microciclo.findUnique({
      where: { id: microcicloId },
    });

    if (!microciclo) {
      throw new BadRequestException('Microciclo no encontrado');
    }

    const fecha = new Date(createSesionDto.fecha);

    // Validar que la fecha de la sesión está dentro del rango del microciclo
    if (fecha < microciclo.fechaInicio || fecha > microciclo.fechaFin) {
      throw new BadRequestException(
        `La fecha de la sesión debe estar entre ${microciclo.fechaInicio.toISOString().split('T')[0]} ` +
          `y ${microciclo.fechaFin.toISOString().split('T')[0]}`
      );
    }

    // Crear sesión
    const sesion = await this.prisma.sesion.create({
      data: {
        microcicloId,
        fecha,
        diaSemana: createSesionDto.diaSemana,
        numeroSesion: createSesionDto.numeroSesion,
        tipoSesion: createSesionDto.tipoSesion,
        turno: createSesionDto.turno || 'COMPLETO',
        tipoPlanificacion: createSesionDto.tipoPlanificacion || 'INICIAL',
        sesionBaseId: createSesionDto.sesionBaseId ? BigInt(createSesionDto.sesionBaseId) : null,
        creadoPor: createSesionDto.creadoPor || 'COMITE_TECNICO',
        duracionPlanificada: createSesionDto.duracionPlanificada,
        volumenPlanificado: createSesionDto.volumenPlanificado,
        intensidadPlanificada: createSesionDto.intensidadPlanificada,
        volumenReal: createSesionDto.volumenReal,
        intensidadReal: createSesionDto.intensidadReal,
        contenidoFisico: createSesionDto.contenidoFisico,
        contenidoTecnico: createSesionDto.contenidoTecnico,
        contenidoTactico: createSesionDto.contenidoTactico,
        calentamiento: createSesionDto.calentamiento,
        partePrincipal: createSesionDto.partePrincipal,
        vueltaCalma: createSesionDto.vueltaCalma,
        observaciones: createSesionDto.observaciones,
        materialNecesario: createSesionDto.materialNecesario,
      },
      include: {
        microciclo: {
          select: {
            id: true,
            numeroGlobalMicrociclo: true,
            fechaInicio: true,
            fechaFin: true,
          },
        },
      },
    });

    return this.formatSesionResponse(sesion);
  }

  // Listar sesiones con filtros opcionales y filtrado por rol
  async findAll(
    userId: bigint,
    rol: string,
    microcicloId?: string,
    fecha?: string,
    page = 1,
    limit = 10
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (microcicloId) {
      where.microcicloId = BigInt(microcicloId);
    }
    if (fecha) {
      where.fecha = new Date(fecha);
    }

    // Si es ENTRENADOR, usar nested filter de Prisma (3 queries → 1 query)
    if (rol === 'ENTRENADOR') {
      const entrenadorId = await this.accessControl.getEntrenadorId(userId);

      if (!entrenadorId) {
        throw new NotFoundException('Entrenador no encontrado');
      }

      // Usar nested filter para filtrar sesiones de microciclos con atletas del entrenador
      where.microciclo = {
        asignacionesAtletas: {
          some: {
            atleta: {
              entrenadorAsignadoId: entrenadorId,
            },
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

      // Filtrar sesiones de microciclos asignados al atleta
      where.microciclo = {
        asignacionesAtletas: {
          some: {
            atletaId: atletaId,
          },
        },
      };
    }

    const [sesiones, total] = await Promise.all([
      this.prisma.sesion.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ fecha: 'asc' }, { numeroSesion: 'asc' }],
        include: {
          microciclo: {
            select: {
              id: true,
              numeroGlobalMicrociclo: true,
              fechaInicio: true,
              fechaFin: true,
            },
          },
        },
      }),
      this.prisma.sesion.count({ where }),
    ]);

    return {
      data: sesiones.map((s) => this.formatSesionResponse(s)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Obtener una sesión por ID (con validación de ownership para ENTRENADOR)
  async findOne(id: string, userId: bigint, rol: string): Promise<SesionResponseDto> {
    const sesion = await this.prisma.sesion.findUnique({
      where: { id: BigInt(id) },
      include: {
        microciclo: {
          select: {
            id: true,
            numeroGlobalMicrociclo: true,
            fechaInicio: true,
            fechaFin: true,
          },
        },
      },
    });

    if (!sesion) {
      throw new NotFoundException('Sesión no encontrada');
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
          microcicloId: sesion.microcicloId,
          atleta: {
            entrenadorAsignadoId: entrenadorId,
          },
        },
      });

      if (!asignacion) {
        throw new NotFoundException('Sesión no encontrada o no autorizada');
      }
    }

    // Si es ATLETA, validar que esta asignado al microciclo de esta sesion
    if (rol === 'ATLETA') {
      const atletaId = await this.accessControl.getAtletaId(userId);

      if (!atletaId) {
        throw new NotFoundException('No se encontro el perfil de atleta para este usuario');
      }

      const asignacion = await this.prisma.asignacionAtletaMicrociclo.findFirst({
        where: {
          microcicloId: sesion.microcicloId,
          atletaId: atletaId,
        },
      });

      if (!asignacion) {
        throw new ForbiddenException('No tienes permiso para ver esta sesion');
      }
    }

    return this.formatSesionResponse(sesion);
  }

  // Actualizar una sesión
  @Transactional()
  async update(id: string, updateSesionDto: UpdateSesionDto): Promise<SesionResponseDto> {
    const existingSesion = await this.prisma.sesion.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existingSesion) {
      throw new NotFoundException('Sesión no encontrada');
    }

    // Si se actualiza la fecha, validar que esté en el rango del microciclo
    if (updateSesionDto.fecha) {
      const microciclo = await this.prisma.microciclo.findUnique({
        where: { id: existingSesion.microcicloId },
      });

      if (microciclo) {
        const nuevaFecha = new Date(updateSesionDto.fecha);
        if (nuevaFecha < microciclo.fechaInicio || nuevaFecha > microciclo.fechaFin) {
          throw new BadRequestException(
            `La fecha de la sesión debe estar entre ${microciclo.fechaInicio.toISOString().split('T')[0]} ` +
              `y ${microciclo.fechaFin.toISOString().split('T')[0]}`
          );
        }
      }
    }

    // Actualizar
    const sesion = await this.prisma.sesion.update({
      where: { id: BigInt(id) },
      data: {
        ...(updateSesionDto.fecha && { fecha: new Date(updateSesionDto.fecha) }),
        ...(updateSesionDto.diaSemana && { diaSemana: updateSesionDto.diaSemana }),
        ...(updateSesionDto.numeroSesion && { numeroSesion: updateSesionDto.numeroSesion }),
        ...(updateSesionDto.tipoSesion && { tipoSesion: updateSesionDto.tipoSesion }),
        ...(updateSesionDto.turno && { turno: updateSesionDto.turno }),
        ...(updateSesionDto.tipoPlanificacion && {
          tipoPlanificacion: updateSesionDto.tipoPlanificacion,
        }),
        ...(updateSesionDto.sesionBaseId && { sesionBaseId: BigInt(updateSesionDto.sesionBaseId) }),
        ...(updateSesionDto.creadoPor && { creadoPor: updateSesionDto.creadoPor }),
        ...(updateSesionDto.duracionPlanificada !== undefined && {
          duracionPlanificada: updateSesionDto.duracionPlanificada,
        }),
        ...(updateSesionDto.volumenPlanificado !== undefined && {
          volumenPlanificado: updateSesionDto.volumenPlanificado,
        }),
        ...(updateSesionDto.intensidadPlanificada !== undefined && {
          intensidadPlanificada: updateSesionDto.intensidadPlanificada,
        }),
        ...(updateSesionDto.volumenReal !== undefined && {
          volumenReal: updateSesionDto.volumenReal,
        }),
        ...(updateSesionDto.intensidadReal !== undefined && {
          intensidadReal: updateSesionDto.intensidadReal,
        }),
        ...(updateSesionDto.contenidoFisico && {
          contenidoFisico: updateSesionDto.contenidoFisico,
        }),
        ...(updateSesionDto.contenidoTecnico && {
          contenidoTecnico: updateSesionDto.contenidoTecnico,
        }),
        ...(updateSesionDto.contenidoTactico && {
          contenidoTactico: updateSesionDto.contenidoTactico,
        }),
        ...(updateSesionDto.calentamiento !== undefined && {
          calentamiento: updateSesionDto.calentamiento,
        }),
        ...(updateSesionDto.partePrincipal !== undefined && {
          partePrincipal: updateSesionDto.partePrincipal,
        }),
        ...(updateSesionDto.vueltaCalma !== undefined && {
          vueltaCalma: updateSesionDto.vueltaCalma,
        }),
        ...(updateSesionDto.observaciones !== undefined && {
          observaciones: updateSesionDto.observaciones,
        }),
        ...(updateSesionDto.materialNecesario !== undefined && {
          materialNecesario: updateSesionDto.materialNecesario,
        }),
      },
      include: {
        microciclo: {
          select: {
            id: true,
            numeroGlobalMicrociclo: true,
            fechaInicio: true,
            fechaFin: true,
          },
        },
      },
    });

    return this.formatSesionResponse(sesion);
  }

  // Eliminar una sesión
  @Transactional()
  async remove(id: string): Promise<{ message: string }> {
    const sesion = await this.prisma.sesion.findUnique({
      where: { id: BigInt(id) },
    });

    if (!sesion) {
      throw new NotFoundException('Sesión no encontrada');
    }

    await this.prisma.sesion.delete({
      where: { id: BigInt(id) },
    });

    return { message: 'Sesión eliminada permanentemente' };
  }

  // Obtener sesiones de microciclos asignados a un atleta especifico
  // Usado para filtrar sesiones al registrar post-entrenamiento o test fisico
  // tipoSesion: Filtro opcional por tipo de sesion (puede ser un valor o array separado por comas)
  async findByAtleta(atletaId: string, userId: bigint, rol: string, tipoSesion?: string) {
    const atletaIdBigInt = BigInt(atletaId);

    // Si es ENTRENADOR, verificar que el atleta le pertenece
    if (rol === 'ENTRENADOR') {
      const entrenadorId = await this.accessControl.getEntrenadorId(userId);

      if (!entrenadorId) {
        throw new NotFoundException('Entrenador no encontrado');
      }

      // Verificar que el atleta esta asignado a este entrenador
      const atleta = await this.prisma.atleta.findUnique({
        where: { id: atletaIdBigInt },
        select: { entrenadorAsignadoId: true },
      });

      if (!atleta || atleta.entrenadorAsignadoId !== entrenadorId) {
        throw new ForbiddenException('No tienes permiso para ver sesiones de este atleta');
      }
    }

    // Buscar microciclos donde el atleta esta asignado
    const asignaciones = await this.prisma.asignacionAtletaMicrociclo.findMany({
      where: {
        atletaId: atletaIdBigInt,
      },
      select: {
        microcicloId: true,
      },
    });

    if (asignaciones.length === 0) {
      return {
        data: [],
        meta: {
          atletaId,
          message: 'El atleta no tiene microciclos asignados',
        },
      };
    }

    const microcicloIds = asignaciones.map((a) => a.microcicloId);

    // Construir filtro de tipo de sesion (soporta valor unico o array separado por comas)
    let tipoSesionFilter: any = undefined;
    if (tipoSesion) {
      const tipos = tipoSesion.split(',').map((t) => t.trim());
      if (tipos.length === 1) {
        tipoSesionFilter = tipos[0];
      } else {
        tipoSesionFilter = { in: tipos };
      }
    }

    // Buscar sesiones de esos microciclos con filtro opcional de tipo
    const sesiones = await this.prisma.sesion.findMany({
      where: {
        microcicloId: { in: microcicloIds },
        ...(tipoSesionFilter && { tipoSesion: tipoSesionFilter }),
      },
      orderBy: [{ fecha: 'asc' }, { numeroSesion: 'asc' }],
      include: {
        microciclo: {
          select: {
            id: true,
            numeroGlobalMicrociclo: true,
            fechaInicio: true,
            fechaFin: true,
          },
        },
      },
    });

    return {
      data: sesiones.map((s) => this.formatSesionResponse(s)),
      meta: {
        atletaId,
        microciclosAsignados: microcicloIds.map((id) => id.toString()),
        totalSesiones: sesiones.length,
      },
    };
  }

  // Método auxiliar para formatear respuesta
  private formatSesionResponse(sesion: any): SesionResponseDto {
    return {
      id: sesion.id.toString(),
      microcicloId: sesion.microcicloId.toString(),
      fecha: sesion.fecha,
      diaSemana: sesion.diaSemana,
      numeroSesion: sesion.numeroSesion,
      tipoSesion: sesion.tipoSesion,
      turno: sesion.turno,
      tipoPlanificacion: sesion.tipoPlanificacion,
      sesionBaseId: sesion.sesionBaseId ? sesion.sesionBaseId.toString() : null,
      creadoPor: sesion.creadoPor,
      duracionPlanificada: sesion.duracionPlanificada,
      volumenPlanificado: sesion.volumenPlanificado,
      intensidadPlanificada: sesion.intensidadPlanificada,
      volumenReal: sesion.volumenReal,
      intensidadReal: sesion.intensidadReal,
      contenidoFisico: sesion.contenidoFisico,
      contenidoTecnico: sesion.contenidoTecnico,
      contenidoTactico: sesion.contenidoTactico,
      calentamiento: sesion.calentamiento,
      partePrincipal: sesion.partePrincipal,
      vueltaCalma: sesion.vueltaCalma,
      observaciones: sesion.observaciones,
      materialNecesario: sesion.materialNecesario,
      createdAt: sesion.createdAt,
      updatedAt: sesion.updatedAt,
      ...(sesion.microciclo && {
        microciclo: {
          id: sesion.microciclo.id.toString(),
          numeroGlobalMicrociclo: sesion.microciclo.numeroGlobalMicrociclo,
          fechaInicio: sesion.microciclo.fechaInicio,
          fechaFin: sesion.microciclo.fechaFin,
        },
      }),
    };
  }
}
