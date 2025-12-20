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
        throw new NotFoundException(
          `La sesion con ID ${sesionId} no existe`,
        );
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

      // 3. Validar relacion 1:1 - solo un registro por sesion/atleta
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

      // 4. Crear el registro con dolencias anidadas (si existen)
      const registro = await tx.registroPostEntrenamiento.create({
        data: {
          atletaId,
          sesionId,
          entrenadorRegistroId,
          asistio: dto.asistio,
          motivoInasistencia: dto.motivoInasistencia,
          ejerciciosCompletados: dto.ejerciciosCompletados,
          intensidadAlcanzada: dto.intensidadAlcanzada,
          duracionReal: dto.duracionReal,
          rpe: dto.rpe,
          calidadSueno: dto.calidadSueno,
          horasSueno: dto.horasSueno,
          estadoAnimico: dto.estadoAnimico,
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

      // 5. Formatear respuesta con BigInt convertidos a string
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

    // Filtros adicionales
    if (atletaId) {
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

  // Metodo auxiliar para formatear respuesta con BigInt convertidos a string
  private formatResponse(registro: any) {
    return {
      id: registro.id.toString(),
      atletaId: registro.atletaId.toString(),
      sesionId: registro.sesionId.toString(),
      entrenadorRegistroId: registro.entrenadorRegistroId.toString(),
      fechaRegistro: registro.fechaRegistro,
      asistio: registro.asistio,
      motivoInasistencia: registro.motivoInasistencia,
      ejerciciosCompletados: registro.ejerciciosCompletados,
      intensidadAlcanzada: registro.intensidadAlcanzada,
      duracionReal: registro.duracionReal,
      rpe: registro.rpe,
      calidadSueno: registro.calidadSueno,
      horasSueno: registro.horasSueno,
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
