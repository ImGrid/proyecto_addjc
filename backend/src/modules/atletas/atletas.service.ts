import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AccessControlService } from '../../common/services/access-control.service';
import { AuthService } from '../auth/auth.service';
import { CreateAtletaDto, UpdateAtletaDto, QueryAtletaDto, AtletaResponseDto } from './dto';

@Injectable()
export class AtletasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessControl: AccessControlService,
    private readonly authService: AuthService,
  ) {}

  // Helper para aplanar entrenadorAsignado (consistencia con otros endpoints)
  // Transforma { id, usuario: { nombreCompleto } } a { id, nombreCompleto }
  private transformAtletaResponse(atleta: any) {
    if (!atleta) return atleta;

    return {
      ...atleta,
      entrenadorAsignado: atleta.entrenadorAsignado
        ? {
            id: atleta.entrenadorAsignado.id,
            nombreCompleto: atleta.entrenadorAsignado.usuario?.nombreCompleto || null,
          }
        : null,
    };
  }

  // Crear un nuevo atleta (incluye crear usuario con rol ATLETA)
  async create(createAtletaDto: CreateAtletaDto) {
    // Verificar que el email no exista
    const existingEmail = await this.prisma.usuario.findUnique({
      where: { email: createAtletaDto.email },
    });

    if (existingEmail) {
      throw new ConflictException('El email ya está registrado');
    }

    // Verificar que el CI no exista
    const existingCI = await this.prisma.usuario.findUnique({
      where: { ci: createAtletaDto.ci },
    });

    if (existingCI) {
      throw new ConflictException('El CI ya está registrado');
    }

    // Si se proporciona entrenadorAsignadoId, verificar que existe
    if (createAtletaDto.entrenadorAsignadoId) {
      const entrenadorId = BigInt(createAtletaDto.entrenadorAsignadoId);
      const entrenador = await this.prisma.entrenador.findUnique({
        where: { id: entrenadorId },
      });

      if (!entrenador) {
        throw new BadRequestException('El entrenador asignado no existe');
      }
    }

    // Hashear la contraseña
    const hashedPassword = await this.authService.hashPassword(createAtletaDto.contrasena);

    // Crear usuario + atleta en una transaccion
    const result = await this.prisma.$transaction(async (tx) => {
      // Crear usuario con rol ATLETA
      const usuario = await tx.usuario.create({
        data: {
          ci: createAtletaDto.ci,
          nombreCompleto: createAtletaDto.nombreCompleto,
          email: createAtletaDto.email,
          contrasena: hashedPassword,
          rol: 'ATLETA', // Rol fijo para atletas
          estado: true,
        },
      });

      // Crear atleta asociado al usuario
      const atleta = await tx.atleta.create({
        data: {
          usuarioId: usuario.id,
          municipio: createAtletaDto.municipio,
          club: createAtletaDto.club,
          categoria: createAtletaDto.categoria,
          fechaNacimiento: new Date(createAtletaDto.fechaNacimiento),
          edad: createAtletaDto.edad,
          direccion: createAtletaDto.direccion,
          telefono: createAtletaDto.telefono,
          entrenadorAsignadoId: createAtletaDto.entrenadorAsignadoId ? BigInt(createAtletaDto.entrenadorAsignadoId) : null,
          categoriaPeso: createAtletaDto.categoriaPeso,
          pesoActual: createAtletaDto.pesoActual,
          fcReposo: createAtletaDto.fcReposo,
        },
        select: {
          id: true,
          usuarioId: true,
          municipio: true,
          club: true,
          categoria: true,
          fechaNacimiento: true,
          edad: true,
          direccion: true,
          telefono: true,
          entrenadorAsignadoId: true,
          categoriaPeso: true,
          pesoActual: true,
          fcReposo: true,
          createdAt: true,
          updatedAt: true,
          usuario: {
            select: {
              id: true,
              ci: true,
              nombreCompleto: true,
              email: true,
              estado: true,
            },
          },
          entrenadorAsignado: {
            select: {
              id: true,
              usuario: {
                select: {
                  nombreCompleto: true,
                },
              },
            },
          },
        },
      });

      return atleta;
    });

    return this.transformAtletaResponse(result);
  }

  // Listar atletas con filtros y paginacion
  async findAll(queryDto: QueryAtletaDto, currentUserId?: string, currentUserRole?: string) {
    const { nombreCompleto, club, categoria, categoriaPeso, entrenadorAsignadoId, estado, page = 1, limit = 10 } = queryDto;

    // Construir filtros dinamicos
    const where: any = {};

    if (nombreCompleto) {
      where.usuario = {
        nombreCompleto: { contains: nombreCompleto, mode: 'insensitive' },
      };
    }

    if (club) {
      where.club = { contains: club, mode: 'insensitive' };
    }

    if (categoria) {
      where.categoria = categoria;
    }

    if (categoriaPeso) {
      where.categoriaPeso = categoriaPeso;
    }

    if (entrenadorAsignadoId) {
      where.entrenadorAsignadoId = BigInt(entrenadorAsignadoId);
    }

    if (estado !== undefined) {
      where.usuario = { ...where.usuario, estado };
    }

    // Si el usuario es ENTRENADOR, solo mostrar sus atletas asignados
    if (currentUserRole === 'ENTRENADOR' && currentUserId) {
      const entrenadorId = await this.accessControl.getEntrenadorId(BigInt(currentUserId));

      if (entrenadorId) {
        where.entrenadorAsignadoId = entrenadorId;
      } else {
        // Si no tiene perfil de entrenador, no mostrar nada
        return {
          data: [],
          meta: { total: 0, page, limit, totalPages: 0 },
        };
      }
    }

    // Calcular skip para paginacion
    const skip = (page - 1) * limit;

    // Ejecutar consultas en paralelo con select explícito
    const [atletas, total] = await Promise.all([
      this.prisma.atleta.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          usuarioId: true,
          municipio: true,
          club: true,
          categoria: true,
          fechaNacimiento: true,
          edad: true,
          direccion: true,
          telefono: true,
          entrenadorAsignadoId: true,
          categoriaPeso: true,
          pesoActual: true,
          fcReposo: true,
          createdAt: true,
          updatedAt: true,
          usuario: {
            select: {
              id: true,
              ci: true,
              nombreCompleto: true,
              email: true,
              estado: true,
            },
          },
          entrenadorAsignado: {
            select: {
              id: true,
              usuario: {
                select: {
                  nombreCompleto: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.atleta.count({ where }),
    ]);

    return {
      data: atletas.map((atleta) => this.transformAtletaResponse(atleta)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Obtener un atleta por ID
  async findOne(id: string, currentUserId?: string, currentUserRole?: string) {
    const atletaId = BigInt(id);

    const atleta = await this.prisma.atleta.findUnique({
      where: { id: atletaId },
      select: {
        id: true,
        usuarioId: true,
        municipio: true,
        club: true,
        categoria: true,
        fechaNacimiento: true,
        edad: true,
        direccion: true,
        telefono: true,
        entrenadorAsignadoId: true,
        categoriaPeso: true,
        pesoActual: true,
        fcReposo: true,
        createdAt: true,
        updatedAt: true,
        usuario: {
          select: {
            id: true,
            ci: true,
            nombreCompleto: true,
            email: true,
            estado: true,
          },
        },
        entrenadorAsignado: {
          select: {
            id: true,
            usuario: {
              select: {
                nombreCompleto: true,
              },
            },
          },
        },
      },
    });

    if (!atleta) {
      throw new NotFoundException('Atleta no encontrado');
    }

    // Si el usuario es ENTRENADOR, verificar que sea su atleta asignado
    if (currentUserRole === 'ENTRENADOR' && currentUserId) {
      const hasAccess = await this.accessControl.checkAtletaOwnership(
        BigInt(currentUserId),
        'ENTRENADOR' as any,
        atleta.id,
      );

      if (!hasAccess) {
        throw new ForbiddenException('No tienes permiso para ver este atleta');
      }
    }

    return this.transformAtletaResponse(atleta);
  }

  // Actualizar un atleta
  async update(id: string, updateAtletaDto: UpdateAtletaDto) {
    const atletaId = BigInt(id);

    // Verificar que el atleta exista
    const existingAtleta = await this.prisma.atleta.findUnique({
      where: { id: atletaId },
    });

    if (!existingAtleta) {
      throw new NotFoundException('Atleta no encontrado');
    }

    // Si se actualiza entrenadorAsignadoId, verificar que existe
    if (updateAtletaDto.entrenadorAsignadoId) {
      const entrenadorId = BigInt(updateAtletaDto.entrenadorAsignadoId);
      const entrenador = await this.prisma.entrenador.findUnique({
        where: { id: entrenadorId },
      });

      if (!entrenador) {
        throw new BadRequestException('El entrenador asignado no existe');
      }
    }

    // Preparar datos para actualizar
    const dataToUpdate: any = { ...updateAtletaDto };

    // Convertir entrenadorAsignadoId a BigInt si existe
    if (updateAtletaDto.entrenadorAsignadoId) {
      dataToUpdate.entrenadorAsignadoId = BigInt(updateAtletaDto.entrenadorAsignadoId);
    }

    // Convertir fechaNacimiento a Date si existe
    if (updateAtletaDto.fechaNacimiento) {
      dataToUpdate.fechaNacimiento = new Date(updateAtletaDto.fechaNacimiento);
    }

    // Actualizar el atleta
    const updatedAtleta = await this.prisma.atleta.update({
      where: { id: atletaId },
      data: dataToUpdate,
      include: {
        usuario: {
          select: {
            id: true,
            ci: true,
            nombreCompleto: true,
            email: true,
            estado: true,
          },
        },
        entrenadorAsignado: {
          include: {
            usuario: {
              select: {
                nombreCompleto: true,
              },
            },
          },
        },
      },
    });

    return this.transformAtletaResponse(updatedAtleta);
  }

  // Eliminar un atleta (hard delete - elimina usuario + atleta por cascade)
  async remove(id: string): Promise<{ message: string }> {
    const atletaId = BigInt(id);

    const atleta = await this.prisma.atleta.findUnique({
      where: { id: atletaId },
      include: { usuario: true },
    });

    if (!atleta) {
      throw new NotFoundException('Atleta no encontrado');
    }

    // Eliminar el usuario (el atleta se elimina por cascade)
    await this.prisma.usuario.delete({
      where: { id: atleta.usuarioId },
    });

    return { message: 'Atleta eliminado permanentemente' };
  }
}
