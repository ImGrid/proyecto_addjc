import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { PrismaService } from '../../database/prisma.service';
import { AccessControlService } from '../../common/services/access-control.service';
import { CreateRegistroPostEntrenamientoDto } from './dto';
import { RolUsuario } from '@prisma/client';

@Injectable()
export class RegistroPostEntrenamientoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessControl: AccessControlService,
  ) {}

  // Crear registro post-entrenamiento con validacion 1:1
  @Transactional()
  async create(dto: CreateRegistroPostEntrenamientoDto, userId: bigint) {
    return await this.prisma.$transaction(async (tx) => {
      // Buscar el entrenadorId usando el userId
      const entrenador = await tx.entrenador.findUnique({
        where: { usuarioId: userId },
        select: { id: true },
      });

      if (!entrenador) {
        throw new BadRequestException(
          'No se encontró el registro de entrenador para este usuario',
        );
      }

      const entrenadorRegistroId = entrenador.id;
      const atletaId = BigInt(dto.atletaId);
      const sesionId = BigInt(dto.sesionId);

      // 1. Verificar que la sesion existe
      const sesion = await tx.sesion.findUnique({
        where: { id: sesionId },
        select: {
          id: true,
          tipoSesion: true,
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
        throw new NotFoundException(
          `La sesion con ID ${sesionId} no existe`,
        );
      }

      // Validar que la sesion sea de tipo ENTRENAMIENTO, RECUPERACION o COMPETENCIA
      const tiposPermitidos = ['ENTRENAMIENTO', 'RECUPERACION', 'COMPETENCIA'];
      if (!tiposPermitidos.includes(sesion.tipoSesion)) {
        throw new BadRequestException(
          `Solo se pueden registrar post-entrenamientos en sesiones de tipo ENTRENAMIENTO, RECUPERACION o COMPETENCIA. La sesion ${sesionId} es de tipo ${sesion.tipoSesion}`,
        );
      }

      // Validar campos requeridos segun tipo de sesion
      // Para COMPETENCIA: solo asistio, motivoInasistencia, dolencias, observaciones
      // Para ENTRENAMIENTO/RECUPERACION: todos los campos de entrenamiento son requeridos
      const esCompetencia = sesion.tipoSesion === 'COMPETENCIA';

      if (!esCompetencia && dto.asistio) {
        // Si asistio y NO es competencia, validar campos de entrenamiento
        if (dto.ejerciciosCompletados === undefined || dto.ejerciciosCompletados === null) {
          throw new BadRequestException('ejerciciosCompletados es requerido para sesiones de entrenamiento');
        }
        if (dto.intensidadAlcanzada === undefined || dto.intensidadAlcanzada === null) {
          throw new BadRequestException('intensidadAlcanzada es requerido para sesiones de entrenamiento');
        }
        if (dto.duracionReal === undefined || dto.duracionReal === null) {
          throw new BadRequestException('duracionReal es requerido para sesiones de entrenamiento');
        }
        if (dto.rpe === undefined || dto.rpe === null) {
          throw new BadRequestException('rpe es requerido para sesiones de entrenamiento');
        }
        if (dto.calidadSueno === undefined || dto.calidadSueno === null) {
          throw new BadRequestException('calidadSueno es requerido para sesiones de entrenamiento');
        }
        if (dto.estadoAnimico === undefined || dto.estadoAnimico === null) {
          throw new BadRequestException('estadoAnimico es requerido para sesiones de entrenamiento');
        }
      }

      // 2. Validar que el atleta existe
      const atleta = await tx.atleta.findUnique({
        where: { id: atletaId },
        include: {
          usuario: {
            select: { nombreCompleto: true, email: true },
          },
        },
      });

      if (!atleta) {
        throw new NotFoundException(
          `El atleta con ID ${atletaId} no existe`,
        );
      }

      // 3. Validar que el atleta esta asignado al microciclo de la sesion
      const asignacion = await tx.asignacionAtletaMicrociclo.findFirst({
        where: {
          atletaId: atletaId,
          microcicloId: sesion.microciclo?.id,
        },
      });

      if (!asignacion) {
        throw new BadRequestException(
          `El atleta ${atleta.usuario.nombreCompleto} no esta asignado al microciclo ${sesion.microciclo?.numeroGlobalMicrociclo || 'desconocido'} de esta sesion`,
        );
      }

      // 4. Validar relacion 1:1 - solo un registro por sesion/atleta
      const registroExistente = await tx.registroPostEntrenamiento.findFirst({
        where: {
          sesionId: sesionId,
          atletaId: atletaId,
        },
      });

      if (registroExistente) {
        throw new ConflictException(
          `Ya existe un registro post-entrenamiento para el atleta ${atleta.usuario.nombreCompleto} en la sesion ${sesionId}`,
        );
      }

      // 5. Crear el registro con dolencias anidadas (si existen)
      // Para COMPETENCIA: usar valores por defecto en campos de entrenamiento
      const registro = await tx.registroPostEntrenamiento.create({
        data: {
          atletaId,
          sesionId,
          entrenadorRegistroId,
          asistio: dto.asistio,
          motivoInasistencia: dto.motivoInasistencia,
          // Campos de entrenamiento: usar valores del DTO o valores por defecto para COMPETENCIA
          // Para COMPETENCIA: usar valores minimos validos (CHECK constraints requieren >= 1)
          // Para ENTRENAMIENTO/RECUPERACION: ya validamos que existen
          ejerciciosCompletados: esCompetencia ? (dto.ejerciciosCompletados ?? 0) : (dto.ejerciciosCompletados ?? 0),
          intensidadAlcanzada: esCompetencia ? (dto.intensidadAlcanzada ?? 0) : (dto.intensidadAlcanzada ?? 0),
          duracionReal: esCompetencia ? (dto.duracionReal ?? 1) : (dto.duracionReal ?? 1),
          rpe: esCompetencia ? (dto.rpe ?? 1) : (dto.rpe ?? 1),
          calidadSueno: esCompetencia ? (dto.calidadSueno ?? 1) : (dto.calidadSueno ?? 1),
          horasSueno: dto.horasSueno,
          estadoAnimico: esCompetencia ? (dto.estadoAnimico ?? 1) : (dto.estadoAnimico ?? 1),
          observaciones: dto.observaciones,
          // Crear dolencias anidadas si existen
          dolencias: dto.dolencias
            ? {
                create: dto.dolencias.map((dolencia) => ({
                  zona: dolencia.zona,
                  nivel: dolencia.nivel,
                  descripcion: dolencia.descripcion,
                  tipoLesion: dolencia.tipoLesion,
                })),
              }
            : undefined,
        },
        include: {
          atleta: {
            include: {
              usuario: {
                select: { nombreCompleto: true, email: true },
              },
            },
          },
          sesion: {
            select: {
              id: true,
              fecha: true,
              numeroSesion: true,
              tipoSesion: true,
              microciclo: {
                select: {
                  numeroGlobalMicrociclo: true,
                },
              },
            },
          },
          entrenador: {
            include: {
              usuario: {
                select: { nombreCompleto: true },
              },
            },
          },
          dolencias: true,
        },
      });

      // 6. Formatear respuesta con BigInt convertidos a string
      return this.formatResponse(registro);
    });
  }

  // Listar registros con filtros
  async findAll(
    userId: bigint,
    userRole: RolUsuario,
    atletaId?: string,
    sesionId?: string,
    page = 1,
    limit = 10,
  ) {
    const skip = (page - 1) * limit;

    // Filtrar por rol
    const whereClause: any = {};

    // COMITE_TECNICO puede ver todos los registros
    // ENTRENADOR solo ve registros de sus atletas asignados
    if (userRole === RolUsuario.ENTRENADOR) {
      const entrenadorId = await this.accessControl.getEntrenadorId(userId);

      if (entrenadorId) {
        whereClause.atleta = {
          entrenadorAsignadoId: entrenadorId,
        };
      }
    }

    // ATLETA solo ve sus propios registros
    if (userRole === RolUsuario.ATLETA) {
      const atletaIdFromUser = await this.accessControl.getAtletaId(userId);

      if (!atletaIdFromUser) {
        throw new NotFoundException('No se encontro el perfil de atleta para este usuario');
      }

      whereClause.atletaId = atletaIdFromUser;
    }

    // Filtros adicionales
    if (atletaId) {
      // Si es ATLETA, validar que no intente ver registros de otro atleta
      if (userRole === RolUsuario.ATLETA) {
        const atletaIdFromUser = await this.accessControl.getAtletaId(userId);
        if (BigInt(atletaId) !== atletaIdFromUser) {
          throw new ForbiddenException('Solo puedes ver tus propios registros');
        }
      }
      whereClause.atletaId = BigInt(atletaId);
    }
    if (sesionId) {
      whereClause.sesionId = BigInt(sesionId);
    }

    const [registros, total] = await Promise.all([
      this.prisma.registroPostEntrenamiento.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { fechaRegistro: 'desc' },
        include: {
          atleta: {
            include: {
              usuario: { select: { nombreCompleto: true } },
            },
          },
          sesion: {
            select: {
              id: true,
              fecha: true,
              numeroSesion: true,
              tipoSesion: true,
            },
          },
          dolencias: {
            where: { recuperado: false }, // Solo dolencias activas
          },
        },
      }),
      this.prisma.registroPostEntrenamiento.count({ where: whereClause }),
    ]);

    return {
      data: registros.map((r) => this.formatResponse(r)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Obtener un registro por ID
  async findOne(id: string, userId: bigint, userRole: RolUsuario) {
    const registro = await this.prisma.registroPostEntrenamiento.findUnique({
      where: { id: BigInt(id) },
      include: {
        atleta: {
          include: {
            usuario: { select: { nombreCompleto: true, email: true } },
          },
        },
        sesion: {
          include: {
            microciclo: {
              select: {
                numeroGlobalMicrociclo: true,
                fechaInicio: true,
                fechaFin: true,
              },
            },
          },
        },
        entrenador: {
          include: {
            usuario: { select: { nombreCompleto: true } },
          },
        },
        dolencias: true,
      },
    });

    if (!registro) {
      throw new NotFoundException('Registro post-entrenamiento no encontrado');
    }

    // Verificar autorizacion si es ENTRENADOR
    if (userRole === RolUsuario.ENTRENADOR) {
      const hasAccess = await this.accessControl.checkAtletaOwnership(
        userId,
        userRole,
        registro.atleta.id,
      );

      if (!hasAccess) {
        throw new ForbiddenException('No tienes permiso para ver este registro');
      }
    }

    // Verificar autorizacion si es ATLETA
    if (userRole === RolUsuario.ATLETA) {
      const atletaId = await this.accessControl.getAtletaId(userId);

      if (!atletaId) {
        throw new NotFoundException('No se encontro el perfil de atleta para este usuario');
      }

      if (registro.atleta.id !== atletaId) {
        throw new ForbiddenException('Solo puedes ver tus propios registros');
      }
    }

    return this.formatResponse(registro);
  }

  // Obtener registro de una sesion especifica
  async findBySesion(sesionId: string, userId: bigint, userRole: RolUsuario) {
    const whereClause: any = {
      sesionId: BigInt(sesionId),
    };

    // ENTRENADOR solo ve registros de sus atletas
    if (userRole === RolUsuario.ENTRENADOR) {
      const entrenadorId = await this.accessControl.getEntrenadorId(userId);

      if (entrenadorId) {
        whereClause.atleta = {
          entrenadorAsignadoId: entrenadorId,
        };
      }
    }

    // ATLETA solo ve sus propios registros
    if (userRole === RolUsuario.ATLETA) {
      const atletaId = await this.accessControl.getAtletaId(userId);

      if (!atletaId) {
        throw new NotFoundException('No se encontro el perfil de atleta para este usuario');
      }

      whereClause.atletaId = atletaId;
    }

    const registros = await this.prisma.registroPostEntrenamiento.findMany({
      where: whereClause,
      include: {
        atleta: {
          include: {
            usuario: { select: { nombreCompleto: true } },
          },
        },
        dolencias: true,
      },
    });

    return registros.map((r) => this.formatResponse(r));
  }

  // Metodo auxiliar para formatear respuesta con BigInt a string y Decimal a number
  private formatResponse(registro: any) {
    return {
      id: registro.id.toString(),
      atletaId: registro.atletaId.toString(),
      sesionId: registro.sesionId.toString(),
      entrenadorRegistroId: registro.entrenadorRegistroId.toString(),
      fechaRegistro: registro.fechaRegistro,
      asistio: registro.asistio,
      motivoInasistencia: registro.motivoInasistencia,
      ejerciciosCompletados: parseFloat(registro.ejerciciosCompletados.toString()),
      intensidadAlcanzada: parseFloat(registro.intensidadAlcanzada.toString()),
      duracionReal: registro.duracionReal,
      rpe: registro.rpe,
      calidadSueno: registro.calidadSueno,
      horasSueno: registro.horasSueno ? parseFloat(registro.horasSueno.toString()) : null,
      estadoAnimico: registro.estadoAnimico,
      observaciones: registro.observaciones,
      createdAt: registro.createdAt,
      updatedAt: registro.updatedAt,
      ...(registro.atleta && {
        atleta: {
          id: registro.atleta.id.toString(),
          nombreCompleto: registro.atleta.usuario?.nombreCompleto,
        },
      }),
      ...(registro.sesion && {
        sesion: {
          id: registro.sesion.id.toString(),
          fecha: registro.sesion.fecha,
          numeroSesion: registro.sesion.numeroSesion,
          tipoSesion: registro.sesion.tipoSesion,
          ...(registro.sesion.microciclo && {
            microciclo: {
              numeroGlobalMicrociclo:
                registro.sesion.microciclo.numeroGlobalMicrociclo,
            },
          }),
        },
      }),
      ...(registro.entrenador && {
        entrenador: {
          id: registro.entrenador.id.toString(),
          nombreCompleto: registro.entrenador.usuario?.nombreCompleto,
        },
      }),
      ...(registro.dolencias && {
        dolencias: registro.dolencias.map((d: any) => ({
          id: d.id.toString(),
          zona: d.zona,
          nivel: d.nivel,
          descripcion: d.descripcion,
          tipoLesion: d.tipoLesion,
          recuperado: d.recuperado,
          fechaRecuperacion: d.fechaRecuperacion,
        })),
      }),
    };
  }
}
