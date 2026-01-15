import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { PrismaService } from '../../../database/prisma.service';
import { AccessControlService } from '../../../common/services/access-control.service';
import { CalculationsService } from './calculations.service';
import { CreateTestFisicoDto, UpdateTestFisicoDto } from '../dto';
import { RolUsuario } from '@prisma/client';

@Injectable()
export class TestsFisicosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessControl: AccessControlService,
    private readonly calculations: CalculationsService
  ) {}

  // ===== CREATE =====

  @Transactional()
  async create(dto: CreateTestFisicoDto, userId: bigint) {
    return await this.prisma.$transaction(async (tx) => {
      // 1. Buscar el entrenadorId usando el userId
      const entrenador = await tx.entrenador.findUnique({
        where: { usuarioId: userId },
        select: { id: true },
      });

      if (!entrenador) {
        throw new BadRequestException('No se encontro el registro de entrenador para este usuario');
      }

      const entrenadorRegistroId = entrenador.id;
      const atletaId = BigInt(dto.atletaId);

      // 2. Verificar que el atleta existe
      const atleta = await tx.atleta.findUnique({
        where: { id: atletaId },
        include: {
          usuario: {
            select: { nombreCompleto: true },
          },
        },
      });

      if (!atleta) {
        throw new NotFoundException(`El atleta con ID ${atletaId} no existe`);
      }

      // 3. Obtener la sesion y validar que existe
      const sesionId = BigInt(dto.sesionId);
      const sesion = await tx.sesion.findUnique({
        where: { id: sesionId },
        select: {
          id: true,
          fecha: true,
          microcicloId: true,
          tipoSesion: true,
          microciclo: {
            select: {
              id: true,
              numeroGlobalMicrociclo: true,
            },
          },
        },
      });

      if (!sesion) {
        throw new NotFoundException(`La sesion con ID ${sesionId} no existe`);
      }

      // Validar que la sesion sea de tipo TEST
      if (sesion.tipoSesion !== 'TEST') {
        throw new BadRequestException(
          `Solo se pueden registrar tests fisicos en sesiones de tipo TEST. La sesion ${sesionId} es de tipo ${sesion.tipoSesion}`
        );
      }

      // 4. Validar que el atleta esta asignado al microciclo de la sesion
      const asignacion = await tx.asignacionAtletaMicrociclo.findFirst({
        where: {
          atletaId: atletaId,
          microcicloId: sesion.microcicloId,
        },
      });

      if (!asignacion) {
        throw new BadRequestException(
          `El atleta no esta asignado al microciclo ${sesion.microciclo?.numeroGlobalMicrociclo || sesion.microcicloId} de esta sesion`
        );
      }

      // 5. Validar relacion 1:1 - solo un test por sesion/atleta
      const testExistente = await tx.testFisico.findFirst({
        where: {
          sesionId: sesion.id,
          atletaId: atletaId,
        },
      });

      if (testExistente) {
        throw new ConflictException(
          `Ya existe un test fisico para este atleta en la sesion ${sesion.id}`
        );
      }

      // 6. Calcular valores automaticos

      // VO2max desde Navette (Formula: 30 + palier × 2)
      const navetteVO2max = dto.navettePalier
        ? this.calculations.calculateVO2maxNavette(dto.navettePalier)
        : null;

      // Buscar test anterior del atleta para calcular intensidades 1RM
      const testAnterior = await tx.testFisico.findFirst({
        where: { atletaId },
        orderBy: { fechaTest: 'desc' },
        select: {
          pressBanca: true,
          tiron: true,
          sentadilla: true,
        },
      });

      // Calcular intensidades como % del 1RM anterior
      const pressBancaIntensidad =
        dto.pressBanca && testAnterior?.pressBanca
          ? this.calculations.calculate1RMIntensity(dto.pressBanca, Number(testAnterior.pressBanca))
          : null;

      const tironIntensidad =
        dto.tiron && testAnterior?.tiron
          ? this.calculations.calculate1RMIntensity(dto.tiron, Number(testAnterior.tiron))
          : null;

      const sentadillaIntensidad =
        dto.sentadilla && testAnterior?.sentadilla
          ? this.calculations.calculate1RMIntensity(dto.sentadilla, Number(testAnterior.sentadilla))
          : null;

      // Normalizar test1500m a formato ISO valido para PostgreSQL TIME
      let test1500mDate: Date | null = null;
      if (dto.test1500m) {
        const segundos = this.calculations.parseTimeToSeconds(dto.test1500m);
        if (segundos !== null) {
          // Convertir segundos a formato HH:MM:SS con ceros
          const horas = Math.floor(segundos / 3600);
          const minutos = Math.floor((segundos % 3600) / 60);
          const segs = segundos % 60;
          const tiempoISO = `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
          test1500mDate = new Date(`1970-01-01T${tiempoISO}`);
        }
      }

      // 7. Crear el test fisico
      // fechaTest y microcicloId se derivan de la sesion
      const test = await tx.testFisico.create({
        data: {
          atletaId,
          entrenadorRegistroId,
          sesionId: sesion.id,
          microcicloId: sesion.microcicloId,
          fechaTest: sesion.fecha,

          // Asistencia (default true si no se proporciona)
          asistio: dto.asistio ?? true,
          motivoInasistencia: dto.motivoInasistencia,

          // Tests de fuerza maxima
          pressBanca: dto.pressBanca,
          pressBancaIntensidad,
          tiron: dto.tiron,
          tironIntensidad,
          sentadilla: dto.sentadilla,
          sentadillaIntensidad,

          // Tests de fuerza resistencia
          barraFija: dto.barraFija,
          paralelas: dto.paralelas,

          // Tests de resistencia aerobica
          navettePalier: dto.navettePalier,
          navetteVO2max,
          test1500m: test1500mDate,
          test1500mVO2max: null,

          // Observaciones
          observaciones: dto.observaciones,
          condicionesTest: dto.condicionesTest,
        },
        include: {
          atleta: {
            include: {
              usuario: {
                select: { nombreCompleto: true },
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
          sesion: {
            select: {
              id: true,
              fecha: true,
              numeroSesion: true,
            },
          },
          microciclo: {
            select: {
              id: true,
              numeroGlobalMicrociclo: true,
            },
          },
        },
      });

      // 8. Formatear respuesta con clasificacion VO2max
      return this.formatResponse(test);
    });
  }

  // ===== READ =====

  // Listar tests con filtros y paginacion
  async findAll(
    userId: bigint,
    userRole: RolUsuario,
    atletaId?: string,
    microcicloId?: string,
    page = 1,
    limit = 10
  ) {
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    // ENTRENADOR solo ve tests de sus atletas asignados
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
    if (microcicloId) {
      whereClause.microcicloId = BigInt(microcicloId);
    }

    const [tests, total] = await Promise.all([
      this.prisma.testFisico.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { fechaTest: 'desc' },
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
            },
          },
          microciclo: {
            select: {
              id: true,
              numeroGlobalMicrociclo: true,
            },
          },
        },
      }),
      this.prisma.testFisico.count({ where: whereClause }),
    ]);

    return {
      data: tests.map((t) => this.formatResponse(t)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Obtener test por ID
  async findOne(id: string, userId: bigint, userRole: RolUsuario) {
    const test = await this.prisma.testFisico.findUnique({
      where: { id: BigInt(id) },
      include: {
        atleta: {
          select: {
            id: true,
            entrenadorAsignadoId: true,
            usuario: { select: { nombreCompleto: true, email: true } },
          },
        },
        entrenador: {
          include: {
            usuario: { select: { nombreCompleto: true } },
          },
        },
        sesion: {
          select: {
            id: true,
            fecha: true,
            numeroSesion: true,
          },
        },
        microciclo: {
          select: {
            id: true,
            numeroGlobalMicrociclo: true,
          },
        },
      },
    });

    if (!test) {
      throw new NotFoundException('Test fisico no encontrado');
    }

    // Verificar autorizacion si es ENTRENADOR
    if (userRole === RolUsuario.ENTRENADOR) {
      const hasAccess = await this.accessControl.checkAtletaOwnership(
        userId,
        userRole,
        test.atleta.id
      );

      if (!hasAccess) {
        throw new ForbiddenException('No tienes permiso para ver este test');
      }
    }

    // Verificar autorizacion si es ATLETA
    if (userRole === RolUsuario.ATLETA) {
      const atletaId = await this.accessControl.getAtletaId(userId);

      if (!atletaId) {
        throw new NotFoundException('No se encontro el perfil de atleta para este usuario');
      }

      if (test.atleta.id !== atletaId) {
        throw new ForbiddenException('Solo puedes ver tus propios tests fisicos');
      }
    }

    return this.formatResponse(test);
  }

  // Obtener tests de un atleta
  async findByAtleta(atletaId: string, userId: bigint, userRole: RolUsuario) {
    const whereClause: any = {
      atletaId: BigInt(atletaId),
    };

    // ENTRENADOR solo ve tests de sus atletas
    if (userRole === RolUsuario.ENTRENADOR) {
      const entrenadorId = await this.accessControl.getEntrenadorId(userId);

      if (entrenadorId) {
        whereClause.atleta = {
          entrenadorAsignadoId: entrenadorId,
        };
      }
    }

    // ATLETA solo ve sus propios tests
    if (userRole === RolUsuario.ATLETA) {
      const atletaIdFromUser = await this.accessControl.getAtletaId(userId);

      if (!atletaIdFromUser) {
        throw new NotFoundException('No se encontro el perfil de atleta para este usuario');
      }

      if (BigInt(atletaId) !== atletaIdFromUser) {
        throw new ForbiddenException('Solo puedes ver tus propios tests fisicos');
      }
    }

    const tests = await this.prisma.testFisico.findMany({
      where: whereClause,
      orderBy: { fechaTest: 'desc' },
      include: {
        sesion: {
          select: {
            id: true,
            fecha: true,
            numeroSesion: true,
          },
        },
        microciclo: {
          select: {
            id: true,
            numeroGlobalMicrociclo: true,
          },
        },
      },
    });

    return tests.map((t) => this.formatResponse(t));
  }

  // Obtener tests fisicos del atleta autenticado (solo para rol ATLETA)
  // Endpoint optimizado que evita query duplicada de atletaId
  async findMyTests(userId: bigint, userRole: RolUsuario) {
    // Validar que sea rol ATLETA
    if (userRole !== RolUsuario.ATLETA) {
      throw new ForbiddenException('Este endpoint es solo para atletas');
    }

    // Obtener atletaId del usuario autenticado
    const atletaId = await this.accessControl.getAtletaId(userId);

    if (!atletaId) {
      throw new NotFoundException('No se encontro el perfil de atleta para este usuario');
    }

    // Reutilizar metodo existente
    return this.findByAtleta(atletaId.toString(), userId, userRole);
  }

  // Obtener ultimo test de un atleta por tipo
  async findLatestByType(atletaId: string, tipoTest: string, userId: bigint, userRole: RolUsuario) {
    // Verificar autorizacion
    if (userRole === RolUsuario.ENTRENADOR) {
      const hasAccess = await this.accessControl.checkAtletaOwnership(
        userId,
        userRole,
        BigInt(atletaId)
      );

      if (!hasAccess) {
        throw new ForbiddenException('No tienes permiso para ver tests de este atleta');
      }
    }

    // Verificar autorizacion si es ATLETA
    if (userRole === RolUsuario.ATLETA) {
      const atletaIdFromUser = await this.accessControl.getAtletaId(userId);

      if (!atletaIdFromUser) {
        throw new NotFoundException('No se encontro el perfil de atleta para este usuario');
      }

      if (BigInt(atletaId) !== atletaIdFromUser) {
        throw new ForbiddenException('Solo puedes ver tus propios tests fisicos');
      }
    }

    // Mapeo de tipo de test a campo
    const fieldMap: Record<string, string> = {
      pressBanca: 'pressBanca',
      tiron: 'tiron',
      sentadilla: 'sentadilla',
      barraFija: 'barraFija',
      paralelas: 'paralelas',
      navette: 'navettePalier',
      test1500m: 'test1500m',
    };

    const field = fieldMap[tipoTest];
    if (!field) {
      throw new BadRequestException(`Tipo de test invalido: ${tipoTest}`);
    }

    // Buscar ultimo test donde el campo no sea null
    const test = await this.prisma.testFisico.findFirst({
      where: {
        atletaId: BigInt(atletaId),
        [field]: { not: null },
      },
      orderBy: { fechaTest: 'desc' },
      include: {
        atleta: {
          include: {
            usuario: { select: { nombreCompleto: true } },
          },
        },
      },
    });

    if (!test) {
      return null;
    }

    // Extraer el valor ANTES de formatear (puede ser Decimal o number)
    const valorCampo = test[field as keyof typeof test];
    let valorNumerico: number | string | null = null;

    if (valorCampo !== null && valorCampo !== undefined) {
      // Si es objeto Decimal, usar .toNumber()
      if (typeof valorCampo === 'object' && 'toNumber' in valorCampo) {
        valorNumerico = valorCampo.toNumber();
      } else {
        // Si es number directo (barraFija, paralelas)
        valorNumerico = Number(valorCampo);
      }
    }

    return {
      test: this.formatResponse(test),
      tipoTest,
      valor: valorNumerico,
    };
  }

  // ===== STATISTICS =====

  // Obtener estadisticas de un atleta para un tipo de test
  async getStatistics(atletaId: string, tipoTest: string, userId: bigint, userRole: RolUsuario) {
    // Verificar autorizacion
    if (userRole === RolUsuario.ENTRENADOR) {
      const hasAccess = await this.accessControl.checkAtletaOwnership(
        userId,
        userRole,
        BigInt(atletaId)
      );

      if (!hasAccess) {
        throw new ForbiddenException('No tienes permiso para ver estadisticas de este atleta');
      }
    }

    // Verificar autorizacion si es ATLETA
    if (userRole === RolUsuario.ATLETA) {
      const atletaIdFromUser = await this.accessControl.getAtletaId(userId);

      if (!atletaIdFromUser) {
        throw new NotFoundException('No se encontro el perfil de atleta para este usuario');
      }

      if (BigInt(atletaId) !== atletaIdFromUser) {
        throw new ForbiddenException('Solo puedes ver tus propias estadisticas');
      }
    }

    // Mapeo de tipo de test a campo
    const fieldMap: Record<string, string> = {
      pressBanca: 'pressBanca',
      tiron: 'tiron',
      sentadilla: 'sentadilla',
      barraFija: 'barraFija',
      paralelas: 'paralelas',
      navette: 'navettePalier',
    };

    const field = fieldMap[tipoTest];
    if (!field) {
      throw new BadRequestException(`Tipo de test invalido: ${tipoTest}`);
    }

    // Buscar todos los tests del atleta donde el campo no sea null
    const tests = await this.prisma.testFisico.findMany({
      where: {
        atletaId: BigInt(atletaId),
        [field]: { not: null },
      },
      orderBy: { fechaTest: 'asc' },
      select: {
        id: true,
        fechaTest: true,
        [field]: true,
      },
    });

    if (tests.length === 0) {
      return null;
    }

    // Convertir valores usando helper (maneja Decimal correctamente)
    const valores = tests.map((t) => this.extractNumericValue(t[field]));
    const stats = this.calculations.calculateStatistics(valores);
    const tendencia = this.calculations.calculateTrend(valores);

    // Calcular progreso (primer test vs ultimo test)
    const progreso =
      tests.length >= 2
        ? this.calculations.calculateImprovement(valores[valores.length - 1], valores[0])
        : null;

    return {
      atletaId,
      tipoTest,
      estadisticas: stats,
      tendencia,
      progreso,
      historial: tests.map((t) => ({
        id: t.id.toString(),
        fechaTest: t.fechaTest,
        valor: this.extractNumericValue(t[field]),
      })),
    };
  }

  // Obtener evolucion temporal para graficos
  async getEvolution(atletaId: string, tipoTest: string, userId: bigint, userRole: RolUsuario) {
    const stats = await this.getStatistics(atletaId, tipoTest, userId, userRole);

    if (!stats) {
      return null;
    }

    const atleta = await this.prisma.atleta.findUnique({
      where: { id: BigInt(atletaId) },
      include: {
        usuario: { select: { nombreCompleto: true } },
      },
    });

    return {
      atleta: {
        id: atletaId,
        nombreCompleto: atleta?.usuario.nombreCompleto,
      },
      tipoTest,
      tests: stats.historial,
      tendencia: stats.tendencia,
      mejora: stats.progreso,
    };
  }

  // Comparar dos tests
  async compareTests(test1Id: string, test2Id: string, userId: bigint, userRole: RolUsuario) {
    const [test1, test2] = await Promise.all([
      this.findOne(test1Id, userId, userRole),
      this.findOne(test2Id, userId, userRole),
    ]);

    if (!test1 || !test2) {
      throw new BadRequestException('Uno o ambos tests no fueron encontrados');
    }

    if (test1.atletaId !== test2.atletaId) {
      throw new BadRequestException('Los tests deben ser del mismo atleta');
    }

    // Comparar cada tipo de test
    const comparaciones: any = {};

    const campos = [
      'pressBanca',
      'tiron',
      'sentadilla',
      'barraFija',
      'paralelas',
      'navettePalier',
      'navetteVO2max',
    ];

    for (const campo of campos) {
      const valor1 = test1[campo];
      const valor2 = test2[campo];

      if (valor1 !== null && valor2 !== null) {
        const mejora = this.calculations.calculateImprovement(Number(valor2), Number(valor1));

        comparaciones[campo] = {
          test1: Number(valor1),
          test2: Number(valor2),
          mejora,
        };
      }
    }

    return {
      test1: {
        id: test1.id,
        fechaTest: test1.fechaTest,
      },
      test2: {
        id: test2.id,
        fechaTest: test2.fechaTest,
      },
      atletaId: test1.atletaId,
      comparaciones,
    };
  }

  // ===== HELPER METHODS =====

  /**
   * Extrae valor numerico de un campo que puede ser Decimal, number, o null
   * Util para acceso dinamico a campos (t[field])
   */
  private extractNumericValue(value: unknown): number {
    // Null o undefined
    if (value === null || value === undefined) {
      return 0;
    }

    // Objeto Decimal (tiene metodo .toNumber())
    if (typeof value === 'object' && value !== null && 'toNumber' in value) {
      return (value as any).toNumber();
    }

    // Ya es number
    if (typeof value === 'number') {
      return value;
    }

    // Fallback: intentar parsear
    return Number(value) || 0;
  }

  // Formatear DateTime (TIME) a string MM:SS
  private formatTimeToString(time: Date | null): string | null {
    if (!time) return null;

    const minutos = time.getUTCMinutes();
    const segundos = time.getUTCSeconds();

    return `${minutos}:${segundos.toString().padStart(2, '0')}`;
  }

  private formatResponse(test: any) {
    // Calcular clasificacion VO2max si existe
    const clasificacionVO2max = test.navetteVO2max
      ? this.calculations.classifyVO2max(Number(test.navetteVO2max))
      : null;

    // Objetivo VO2max por defecto (60 para hombres segun docs)
    const objetivoVO2max = 60;

    return {
      id: test.id.toString(),
      atletaId: test.atletaId.toString(),
      entrenadorRegistroId: test.entrenadorRegistroId.toString(),
      sesionId: test.sesionId?.toString() || null,
      microcicloId: test.microcicloId?.toString() || null,
      fechaTest: test.fechaTest,

      // Asistencia
      asistio: test.asistio,
      motivoInasistencia: test.motivoInasistencia,

      // Tests de fuerza maxima
      pressBanca: test.pressBanca ? test.pressBanca.toString() : null,
      pressBancaIntensidad: test.pressBancaIntensidad ? test.pressBancaIntensidad.toString() : null,
      tiron: test.tiron ? test.tiron.toString() : null,
      tironIntensidad: test.tironIntensidad ? test.tironIntensidad.toString() : null,
      sentadilla: test.sentadilla ? test.sentadilla.toString() : null,
      sentadillaIntensidad: test.sentadillaIntensidad ? test.sentadillaIntensidad.toString() : null,

      // Tests de fuerza resistencia
      barraFija: test.barraFija,
      paralelas: test.paralelas,

      // Tests de resistencia aerobica
      navettePalier: test.navettePalier ? test.navettePalier.toString() : null,
      navetteVO2max: test.navetteVO2max ? test.navetteVO2max.toString() : null,
      clasificacionVO2max,
      objetivoVO2max,
      test1500m: this.formatTimeToString(test.test1500m),
      test1500mVO2max: test.test1500mVO2max ? test.test1500mVO2max.toString() : null,

      // Observaciones
      observaciones: test.observaciones,
      condicionesTest: test.condicionesTest,

      createdAt: test.createdAt,
      updatedAt: test.updatedAt,

      // Relaciones
      ...(test.atleta && {
        atleta: {
          id: test.atleta.id.toString(),
          nombreCompleto: test.atleta.usuario?.nombreCompleto,
        },
      }),
      ...(test.entrenador && {
        entrenador: {
          id: test.entrenador.id.toString(),
          nombreCompleto: test.entrenador.usuario?.nombreCompleto,
        },
      }),
      ...(test.sesion && {
        sesion: {
          id: test.sesion.id.toString(),
          fecha: test.sesion.fecha,
          numeroSesion: test.sesion.numeroSesion,
        },
      }),
      ...(test.microciclo && {
        microciclo: {
          id: test.microciclo.id.toString(),
          numeroGlobalMicrociclo: test.microciclo.numeroGlobalMicrociclo,
        },
      }),
    };
  }
}
