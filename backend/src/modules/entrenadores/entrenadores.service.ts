import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuthService } from '../auth/auth.service';
import { CreateEntrenadorDto, UpdateEntrenadorDto, QueryEntrenadorDto, AssignAtletaDto, EntrenadorResponseDto } from './dto';

@Injectable()
export class EntrenadoresService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  // Crear un nuevo entrenador (incluye crear usuario con rol ENTRENADOR)
  async create(createEntrenadorDto: CreateEntrenadorDto): Promise<EntrenadorResponseDto> {
    // Verificar que el email no exista
    const existingEmail = await this.prisma.usuario.findUnique({
      where: { email: createEntrenadorDto.email },
    });

    if (existingEmail) {
      throw new ConflictException('El email ya está registrado');
    }

    // Verificar que el CI no exista
    const existingCI = await this.prisma.usuario.findUnique({
      where: { ci: createEntrenadorDto.ci },
    });

    if (existingCI) {
      throw new ConflictException('El CI ya está registrado');
    }

    // Hashear la contraseña
    const hashedPassword = await this.authService.hashPassword(createEntrenadorDto.contrasena);

    // Crear usuario + entrenador en una transaccion
    const result = await this.prisma.$transaction(async (tx) => {
      // Crear usuario con rol ENTRENADOR
      const usuario = await tx.usuario.create({
        data: {
          ci: createEntrenadorDto.ci,
          nombreCompleto: createEntrenadorDto.nombreCompleto,
          email: createEntrenadorDto.email,
          contrasena: hashedPassword,
          rol: 'ENTRENADOR', // Rol fijo para entrenadores
          estado: true,
        },
      });

      // Crear entrenador asociado al usuario
      const entrenador = await tx.entrenador.create({
        data: {
          usuarioId: usuario.id,
          municipio: createEntrenadorDto.municipio,
          especialidad: createEntrenadorDto.especialidad,
        },
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
        },
      });

      return entrenador;
    });

    return this.formatEntrenadorResponse(result);
  }

  // Listar entrenadores con filtros y paginacion
  async findAll(queryDto: QueryEntrenadorDto) {
    const { nombreCompleto, municipio, especialidad, estado, page = 1, limit = 10 } = queryDto;

    // Construir filtros dinamicos
    const where: any = {};

    if (nombreCompleto) {
      where.usuario = {
        nombreCompleto: { contains: nombreCompleto, mode: 'insensitive' },
      };
    }

    if (municipio) {
      where.municipio = { contains: municipio, mode: 'insensitive' };
    }

    if (especialidad) {
      where.especialidad = { contains: especialidad, mode: 'insensitive' };
    }

    if (estado !== undefined) {
      where.usuario = { ...where.usuario, estado };
    }

    // Calcular skip para paginacion
    const skip = (page - 1) * limit;

    // Ejecutar consultas en paralelo
    const [entrenadores, total] = await Promise.all([
      this.prisma.entrenador.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
        },
      }),
      this.prisma.entrenador.count({ where }),
    ]);

    // Formatear respuestas
    const data = entrenadores.map((entrenador) => this.formatEntrenadorResponse(entrenador));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Obtener un entrenador por ID
  async findOne(id: string): Promise<EntrenadorResponseDto> {
    const entrenadorId = BigInt(id);

    const entrenador = await this.prisma.entrenador.findUnique({
      where: { id: entrenadorId },
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
      },
    });

    if (!entrenador) {
      throw new NotFoundException('Entrenador no encontrado');
    }

    return this.formatEntrenadorResponse(entrenador);
  }

  // Actualizar un entrenador
  async update(id: string, updateEntrenadorDto: UpdateEntrenadorDto): Promise<EntrenadorResponseDto> {
    const entrenadorId = BigInt(id);

    // Verificar que el entrenador exista
    const existingEntrenador = await this.prisma.entrenador.findUnique({
      where: { id: entrenadorId },
    });

    if (!existingEntrenador) {
      throw new NotFoundException('Entrenador no encontrado');
    }

    // Actualizar el entrenador
    const updatedEntrenador = await this.prisma.entrenador.update({
      where: { id: entrenadorId },
      data: updateEntrenadorDto,
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
      },
    });

    return this.formatEntrenadorResponse(updatedEntrenador);
  }

  // Eliminar un entrenador (hard delete - elimina usuario + entrenador por cascade)
  async remove(id: string): Promise<{ message: string }> {
    const entrenadorId = BigInt(id);

    const entrenador = await this.prisma.entrenador.findUnique({
      where: { id: entrenadorId },
      include: {
        usuario: true,
        atletasAsignados: true,
      },
    });

    if (!entrenador) {
      throw new NotFoundException('Entrenador no encontrado');
    }

    // Verificar si tiene atletas asignados
    if (entrenador.atletasAsignados.length > 0) {
      throw new BadRequestException(
        `No se puede eliminar el entrenador porque tiene ${entrenador.atletasAsignados.length} atleta(s) asignado(s). Reasigne los atletas primero.`,
      );
    }

    // Eliminar el usuario (el entrenador se elimina por cascade)
    await this.prisma.usuario.delete({
      where: { id: entrenador.usuarioId },
    });

    return { message: 'Entrenador eliminado permanentemente' };
  }

  // Asignar un atleta a este entrenador
  async assignAtleta(entrenadorId: string, assignAtletaDto: AssignAtletaDto): Promise<{ message: string }> {
    const entrenaderId = BigInt(entrenadorId);
    const atletaId = BigInt(assignAtletaDto.atletaId);

    // Verificar que el entrenador exista
    const entrenador = await this.prisma.entrenador.findUnique({
      where: { id: entrenaderId },
    });

    if (!entrenador) {
      throw new NotFoundException('Entrenador no encontrado');
    }

    // Verificar que el atleta exista
    const atleta = await this.prisma.atleta.findUnique({
      where: { id: atletaId },
    });

    if (!atleta) {
      throw new NotFoundException('Atleta no encontrado');
    }

    // Asignar el entrenador al atleta
    await this.prisma.atleta.update({
      where: { id: atletaId },
      data: {
        entrenadorAsignadoId: entrenaderId,
      },
    });

    return { message: 'Atleta asignado exitosamente al entrenador' };
  }

  // Obtener todos los atletas asignados a un entrenador
  async getAtletas(entrenadorId: string) {
    const entrenaderId = BigInt(entrenadorId);

    // Verificar que el entrenador exista
    const entrenador = await this.prisma.entrenador.findUnique({
      where: { id: entrenaderId },
      include: {
        usuario: {
          select: {
            nombreCompleto: true,
          },
        },
        atletasAsignados: {
          include: {
            usuario: {
              select: {
                id: true,
                nombreCompleto: true,
              },
            },
          },
        },
      },
    });

    if (!entrenador) {
      throw new NotFoundException('Entrenador no encontrado');
    }

    // Formatear atletas
    const atletas = entrenador.atletasAsignados.map((atleta) => ({
      id: atleta.id.toString(),
      nombreCompleto: atleta.usuario.nombreCompleto,
      club: atleta.club,
      categoria: atleta.categoria,
      categoriaPeso: atleta.categoriaPeso,
      pesoActual: atleta.pesoActual ? parseFloat(atleta.pesoActual.toString()) : null,
    }));

    return {
      entrenadorId: entrenador.id.toString(),
      nombreCompleto: entrenador.usuario.nombreCompleto,
      totalAtletas: atletas.length,
      atletas,
    };
  }

  // Metodo auxiliar para formatear respuesta
  private formatEntrenadorResponse(entrenador: any): EntrenadorResponseDto {
    return {
      id: entrenador.id.toString(),
      usuarioId: entrenador.usuarioId.toString(),
      municipio: entrenador.municipio,
      especialidad: entrenador.especialidad,
      createdAt: entrenador.createdAt,
      updatedAt: entrenador.updatedAt,
      usuario: {
        id: entrenador.usuario.id.toString(),
        ci: entrenador.usuario.ci,
        nombreCompleto: entrenador.usuario.nombreCompleto,
        email: entrenador.usuario.email,
        estado: entrenador.usuario.estado,
      },
    };
  }
}
