import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { PrismaService } from '../../database/prisma.service';
import { MarcarRecuperadoDto } from './dto';
import { RolUsuario } from '@prisma/client';

@Injectable()
export class DolenciasService {
  constructor(private readonly prisma: PrismaService) {}

  // Listar dolencias con filtros
  async findAll(
    userId: bigint,
    userRole: RolUsuario,
    atletaId?: string,
    recuperado?: boolean,
    page = 1,
    limit = 10,
  ) {
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    // ENTRENADOR solo ve dolencias de sus atletas asignados
    if (userRole === RolUsuario.ENTRENADOR) {
      // Buscar el entrenadorId del usuario
      const entrenador = await this.prisma.entrenador.findUnique({
        where: { usuarioId: userId },
        select: { id: true },
      });

      if (entrenador) {
        whereClause.registroPostEntrenamiento = {
          atleta: {
            entrenadorAsignadoId: entrenador.id,
          },
        };
      }
    }

    // Filtros adicionales
    if (atletaId) {
      whereClause.registroPostEntrenamiento = {
        ...whereClause.registroPostEntrenamiento,
        atletaId: BigInt(atletaId),
      };
    }

    if (recuperado !== undefined) {
      whereClause.recuperado = recuperado;
    }

    const [dolencias, total] = await Promise.all([
      this.prisma.dolencia.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: [{ recuperado: 'asc' }, { createdAt: 'desc' }],
        include: {
          registroPostEntrenamiento: {
            include: {
              atleta: {
                include: {
                  usuario: { select: { nombreCompleto: true } },
                },
              },
              sesion: {
                select: {
                  fecha: true,
                  numeroSesion: true,
                },
              },
            },
          },
          entrenadorRecuperacion: {
            include: {
              usuario: { select: { nombreCompleto: true } },
            },
          },
        },
      }),
      this.prisma.dolencia.count({ where: whereClause }),
    ]);

    return {
      data: dolencias.map((d) => this.formatResponse(d)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Obtener dolencias activas de un atleta
  async findActiveByAtleta(
    atletaId: string,
    userId: bigint,
    userRole: RolUsuario,
  ) {
    const whereClause: any = {
      recuperado: false,
      registroPostEntrenamiento: {
        atletaId: BigInt(atletaId),
      },
    };

    // ENTRENADOR solo ve dolencias de sus atletas
    if (userRole === RolUsuario.ENTRENADOR) {
      // Buscar el entrenadorId del usuario
      const entrenador = await this.prisma.entrenador.findUnique({
        where: { usuarioId: userId },
        select: { id: true },
      });

      if (entrenador) {
        whereClause.registroPostEntrenamiento.atleta = {
          entrenadorAsignadoId: entrenador.id,
        };
      }
    }

    const dolencias = await this.prisma.dolencia.findMany({
      where: whereClause,
      orderBy: { nivel: 'desc' }, // Ordenar por nivel de dolor (más alto primero)
      include: {
        registroPostEntrenamiento: {
          include: {
            sesion: {
              select: {
                fecha: true,
                numeroSesion: true,
              },
            },
          },
        },
      },
    });

    return dolencias.map((d) => this.formatResponse(d));
  }

  // Obtener una dolencia por ID
  async findOne(id: string, userId: bigint, userRole: RolUsuario) {
    const dolencia = await this.prisma.dolencia.findUnique({
      where: { id: BigInt(id) },
      include: {
        registroPostEntrenamiento: {
          include: {
            atleta: {
              include: {
                usuario: { select: { nombreCompleto: true, email: true } },
              },
            },
            sesion: {
              select: {
                fecha: true,
                numeroSesion: true,
              },
            },
          },
        },
        entrenadorRecuperacion: {
          include: {
            usuario: { select: { nombreCompleto: true } },
          },
        },
      },
    });

    if (!dolencia) {
      throw new NotFoundException('Dolencia no encontrada');
    }

    // Verificar autorizacion si es ENTRENADOR
    if (userRole === RolUsuario.ENTRENADOR) {
      // Buscar el entrenadorId del usuario
      const entrenador = await this.prisma.entrenador.findUnique({
        where: { usuarioId: userId },
        select: { id: true },
      });

      if (
        !entrenador ||
        dolencia.registroPostEntrenamiento.atleta.entrenadorAsignadoId !==
          entrenador.id
      ) {
        throw new BadRequestException(
          'No tienes permiso para ver esta dolencia',
        );
      }
    }

    return this.formatResponse(dolencia);
  }

  // Marcar dolencia como recuperada (transicion de estado)
  @Transactional()
  async marcarComoRecuperado(
    dolenciaId: string,
    userId: bigint,
    dto?: MarcarRecuperadoDto,
  ) {
    // 1. Buscar el entrenadorId usando el userId
    const entrenador = await this.prisma.entrenador.findUnique({
      where: { usuarioId: userId },
      select: { id: true },
    });

    if (!entrenador) {
      throw new BadRequestException(
        'No se encontró el registro de entrenador para este usuario',
      );
    }

    const entrenadorId = entrenador.id;

    // 2. Verificar que la dolencia existe
    const dolencia = await this.prisma.dolencia.findUnique({
      where: { id: BigInt(dolenciaId) },
      include: {
        registroPostEntrenamiento: {
          include: {
            atleta: {
              include: {
                usuario: { select: { id: true, nombreCompleto: true } },
              },
            },
          },
        },
      },
    });

    if (!dolencia) {
      throw new NotFoundException(
        `Dolencia con ID ${dolenciaId} no encontrada`,
      );
    }

    // 2. Validar transicion de estado
    if (dolencia.recuperado) {
      throw new BadRequestException(
        `La dolencia ya fue marcada como recuperada el ${dolencia.fechaRecuperacion?.toISOString().split('T')[0]}`,
      );
    }

    // 3. Ejecutar transicion de estado
    const dolenciaActualizada = await this.prisma.dolencia.update({
      where: { id: BigInt(dolenciaId) },
      data: {
        recuperado: true,
        fechaRecuperacion: new Date(),
        recuperadoPor: entrenadorId,
        // Agregar notas de recuperacion a la descripcion si se proporcionan
        descripcion: dto?.notasRecuperacion
          ? `${dolencia.descripcion || ''}\n[RECUPERACION - ${new Date().toISOString().split('T')[0]}]: ${dto.notasRecuperacion}`
          : dolencia.descripcion,
      },
      include: {
        registroPostEntrenamiento: {
          include: {
            atleta: {
              include: {
                usuario: { select: { nombreCompleto: true } },
              },
            },
            sesion: {
              select: {
                fecha: true,
                numeroSesion: true,
              },
            },
          },
        },
        entrenadorRecuperacion: {
          include: {
            usuario: { select: { nombreCompleto: true } },
          },
        },
      },
    });

    // 4. Crear notificacion para el atleta
    await this.prisma.notificacion.create({
      data: {
        destinatarioId: dolencia.registroPostEntrenamiento.atleta.usuarioId,
        tipo: 'OTRO',
        titulo: 'Dolencia marcada como recuperada',
        mensaje: `Tu dolencia en ${dolencia.zona} (nivel ${dolencia.nivel}/10) ha sido marcada como recuperada por tu entrenador`,
        leida: false,
        prioridad: 'BAJA',
      },
    });

    return this.formatResponse(dolenciaActualizada);
  }

  // Metodo auxiliar para formatear respuesta
  private formatResponse(dolencia: any) {
    return {
      id: dolencia.id.toString(),
      registroPostEntrenamientoId:
        dolencia.registroPostEntrenamientoId.toString(),
      zona: dolencia.zona,
      nivel: dolencia.nivel,
      descripcion: dolencia.descripcion,
      tipoLesion: dolencia.tipoLesion,
      recuperado: dolencia.recuperado,
      fechaRecuperacion: dolencia.fechaRecuperacion,
      recuperadoPor: dolencia.recuperadoPor
        ? dolencia.recuperadoPor.toString()
        : null,
      createdAt: dolencia.createdAt,
      updatedAt: dolencia.updatedAt,
      ...(dolencia.registroPostEntrenamiento && {
        registroPostEntrenamiento: {
          id: dolencia.registroPostEntrenamiento.id.toString(),
          fechaRegistro: dolencia.registroPostEntrenamiento.fechaRegistro,
          ...(dolencia.registroPostEntrenamiento.atleta && {
            atleta: {
              id: dolencia.registroPostEntrenamiento.atleta.id.toString(),
              nombreCompleto:
                dolencia.registroPostEntrenamiento.atleta.usuario
                  ?.nombreCompleto,
            },
          }),
          ...(dolencia.registroPostEntrenamiento.sesion && {
            sesion: {
              fecha: dolencia.registroPostEntrenamiento.sesion.fecha,
              numeroSesion:
                dolencia.registroPostEntrenamiento.sesion.numeroSesion,
            },
          }),
        },
      }),
      ...(dolencia.entrenadorRecuperacion && {
        entrenadorRecuperacion: {
          id: dolencia.entrenadorRecuperacion.id.toString(),
          nombreCompleto:
            dolencia.entrenadorRecuperacion.usuario?.nombreCompleto,
        },
      }),
    };
  }
}
