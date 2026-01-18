import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { PrismaService } from '../../../database/prisma.service';
import { AccessControlService } from '../../../common/services/access-control.service';
import { CreateMicrocicloDto, UpdateMicrocicloDto, MicrocicloResponseDto } from '../dto';
import { DateRangeValidator } from '../validators/date-range.validator';
import { SesionFactory } from './sesion.factory';
import { Prisma } from '@prisma/client';
// Importar funciones del algoritmo
import {
  clasificarPerfilAtleta,
  convertirTestPrismaADatos,
} from '../../algoritmo/services/perfil-atleta.service';
import { generarSesiones } from '../../algoritmo/services/generador-sesiones.service';
// Servicio de catalogo de ejercicios
import {
  CatalogoEjerciciosService,
  DolenciaActiva,
  EstadoAtleta,
} from '../../algoritmo/services/catalogo-ejercicios.service';
import { TipoRecomendacion, Prioridad, EstadoRecomendacion } from '@prisma/client';

@Injectable()
export class MicrociclosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessControl: AccessControlService,
    private readonly dateRangeValidator: DateRangeValidator,
    private readonly sesionFactory: SesionFactory,
    private readonly catalogoEjercicios: CatalogoEjerciciosService,
  ) {}

  // Crear un nuevo microciclo (Aggregate Root)
  // Genera automaticamente 7 sesiones PERSONALIZADAS segun el perfil del atleta
  @Transactional()
  async create(
    createMicrocicloDto: CreateMicrocicloDto,
    userId: bigint,
  ): Promise<MicrocicloResponseDto> {
    const fechaInicio = new Date(createMicrocicloDto.fechaInicio);
    const fechaFin = new Date(createMicrocicloDto.fechaFin);

    // Validar que fechaFin > fechaInicio
    this.dateRangeValidator.validateDateOrder(fechaInicio, fechaFin, 'microciclo');

    // Validar que el rango es exactamente 7 dias
    const diffTime = Math.abs(fechaFin.getTime() - fechaInicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays !== 6) {
      throw new BadRequestException(
        'Un microciclo debe durar exactamente 7 dias (fechaFin debe ser fechaInicio + 6 dias)',
      );
    }

    // Si hay mesocicloId, validar fechas jerarquicas
    if (createMicrocicloDto.mesocicloId) {
      const mesocicloId = BigInt(createMicrocicloDto.mesocicloId);
      await this.dateRangeValidator.validateMicrocicloInMesociclo(
        mesocicloId,
        fechaInicio,
        fechaFin,
      );
    }

    // PASO 1: Validar que el atleta existe y obtener sus datos
    const atletaId = BigInt(createMicrocicloDto.atletaId);
    const atleta = await this.prisma.atleta.findUnique({
      where: { id: atletaId },
      include: {
        usuario: { select: { nombreCompleto: true } },
        testsFisicos: {
          orderBy: { fechaTest: 'desc' },
          take: 1,
        },
      },
    });

    if (!atleta) {
      throw new NotFoundException('Atleta no encontrado');
    }

    // PASO 2: Obtener el perfil del atleta usando el algoritmo
    const ultimoTest = atleta.testsFisicos[0] || null;
    const datosTest = convertirTestPrismaADatos(ultimoTest);
    const perfilAtleta = clasificarPerfilAtleta(datosTest, atleta.edad);

    // PASO 2.1: Obtener dolencias activas y estado del atleta
    const [dolenciasActivas, estadoAtleta] = await Promise.all([
      this.obtenerDolenciasActivas(atletaId),
      this.obtenerEstadoAtleta(atletaId),
    ]);

    // PASO 2.2: Obtener etapa del mesociclo si existe
    let etapaMesociclo: string | null = null;
    if (createMicrocicloDto.mesocicloId) {
      const mesociclo = await this.prisma.mesociclo.findUnique({
        where: { id: BigInt(createMicrocicloDto.mesocicloId) },
        select: { etapa: true },
      });
      etapaMesociclo = mesociclo?.etapa || null;
    }

    // PASO 3: Crear microciclo
    const microciclo = await this.prisma.microciclo.create({
      data: {
        mesocicloId: createMicrocicloDto.mesocicloId
          ? BigInt(createMicrocicloDto.mesocicloId)
          : null,
        numeroMicrociclo: createMicrocicloDto.numeroMicrociclo,
        numeroGlobalMicrociclo: createMicrocicloDto.numeroGlobalMicrociclo,
        fechaInicio,
        fechaFin,
        tipoMicrociclo: createMicrocicloDto.tipoMicrociclo,
        volumenTotal: new Prisma.Decimal(createMicrocicloDto.volumenTotal),
        intensidadPromedio: new Prisma.Decimal(createMicrocicloDto.intensidadPromedio),
        objetivoSemanal: createMicrocicloDto.objetivoSemanal,
        observaciones: createMicrocicloDto.observaciones,
        creadoPor: 'SISTEMA_ALGORITMO',
        mediaVolumen: createMicrocicloDto.mediaVolumen
          ? new Prisma.Decimal(createMicrocicloDto.mediaVolumen)
          : null,
        mediaIntensidad: createMicrocicloDto.mediaIntensidad
          ? new Prisma.Decimal(createMicrocicloDto.mediaIntensidad)
          : null,
        sentidoVolumen: createMicrocicloDto.sentidoVolumen,
        sentidoIntensidad: createMicrocicloDto.sentidoIntensidad,
        vCarga1: createMicrocicloDto.vCarga1
          ? new Prisma.Decimal(createMicrocicloDto.vCarga1)
          : null,
        vCarga1Nivel: createMicrocicloDto.vCarga1Nivel,
        iCarga1: createMicrocicloDto.iCarga1
          ? new Prisma.Decimal(createMicrocicloDto.iCarga1)
          : null,
        iCarga1Nivel: createMicrocicloDto.iCarga1Nivel,
        vCarga2: createMicrocicloDto.vCarga2
          ? new Prisma.Decimal(createMicrocicloDto.vCarga2)
          : null,
        vCarga2Nivel: createMicrocicloDto.vCarga2Nivel,
        iCarga2: createMicrocicloDto.iCarga2
          ? new Prisma.Decimal(createMicrocicloDto.iCarga2)
          : null,
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

    // PASO 4: Crear asignacion automatica del atleta al microciclo
    await this.prisma.asignacionAtletaMicrociclo.create({
      data: {
        atletaId: atletaId,
        microcicloId: microciclo.id,
        asignadoPor: userId,
        observaciones: `Asignacion automatica. Perfil: ${perfilAtleta.perfil}`,
      },
    });

    // PASO 5: Generar sesiones PERSONALIZADAS usando el algoritmo
    const resultadoGeneracion = generarSesiones({
      tipoMicrociclo: createMicrocicloDto.tipoMicrociclo,
      fechaInicio,
      fechaFin,
      objetivoSemanal: createMicrocicloDto.objetivoSemanal,
      perfilAtleta,
    });

    // PASO 5.1: Seleccionar ejercicios del catalogo para cada sesion de entrenamiento
    // Esto reemplaza el contenido estatico por ejercicios reales del catalogo
    const alertasDolencias: string[] = [];
    const ejerciciosExcluidosTotales: string[] = [];

    for (const sesion of resultadoGeneracion.sesiones) {
      // Solo seleccionar ejercicios para sesiones de entrenamiento
      if (sesion.tipoSesion === 'ENTRENAMIENTO') {
        const seleccion = await this.catalogoEjercicios.seleccionarEjerciciosParaSesion(
          perfilAtleta.perfil,
          createMicrocicloDto.tipoMicrociclo,
          etapaMesociclo,
          dolenciasActivas,
          estadoAtleta,
          2, // cantidad de ejercicios por tipo
        );

        // Generar contenido usando los ejercicios seleccionados
        const contenido = this.catalogoEjercicios.generarContenidoSesion(seleccion);
        sesion.contenidoFisico = contenido.contenidoFisico;
        sesion.contenidoTecnico = contenido.contenidoTecnico;
        sesion.contenidoTactico = contenido.contenidoTactico;
        sesion.partePrincipal = contenido.partePrincipal;

        // Recolectar alertas y ejercicios excluidos
        alertasDolencias.push(...seleccion.alertas);
        ejerciciosExcluidosTotales.push(...seleccion.ejerciciosExcluidos);
      }
    }

    // Agregar informacion de dolencias a la justificacion
    let justificacionExtra = '';
    if (dolenciasActivas.length > 0) {
      justificacionExtra += ` Dolencias activas: ${dolenciasActivas.map(d => `${d.zona}(${d.nivel})`).join(', ')}.`;
    }
    if (ejerciciosExcluidosTotales.length > 0) {
      const excluidos = [...new Set(ejerciciosExcluidosTotales)].slice(0, 5);
      justificacionExtra += ` Ejercicios excluidos por dolencias: ${excluidos.join(', ')}.`;
    }
    if (alertasDolencias.length > 0) {
      const alertasUnicas = [...new Set(alertasDolencias)];
      justificacionExtra += ` Alertas: ${alertasUnicas.join('; ')}.`;
    }

    // Actualizar justificacion de cada sesion con info de dolencias
    for (const sesion of resultadoGeneracion.sesiones) {
      sesion.justificacionAlgoritmo += justificacionExtra;
    }

    // PASO 6: Crear las 7 sesiones personalizadas en batch
    await this.prisma.sesion.createMany({
      data: resultadoGeneracion.sesiones.map((sesion) => ({
        microcicloId: microciclo.id,
        fecha: sesion.fecha,
        diaSemana: sesion.diaSemana,
        numeroSesion: sesion.numeroSesion,
        tipoSesion: sesion.tipoSesion,
        turno: sesion.turno,
        tipoPlanificacion: sesion.tipoPlanificacion,
        creadoPor: sesion.creadoPor,
        duracionPlanificada: sesion.duracionPlanificada,
        volumenPlanificado: sesion.volumenPlanificado,
        intensidadPlanificada: sesion.intensidadPlanificada,
        contenidoFisico: sesion.contenidoFisico,
        contenidoTecnico: sesion.contenidoTecnico,
        contenidoTactico: sesion.contenidoTactico,
        calentamiento: sesion.calentamiento,
        partePrincipal: sesion.partePrincipal,
        vueltaCalma: sesion.vueltaCalma,
        observaciones: sesion.observaciones,
        aprobado: sesion.aprobado,
        perfilUtilizado: sesion.perfilUtilizado,
        justificacionAlgoritmo: sesion.justificacionAlgoritmo,
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

    // PASO 7: Crear RECOMENDACION para que COMITE_TECNICO apruebe
    // Siguiendo el flujo Human-in-the-Loop: algoritmo genera -> COMITE aprueba
    const sesionesIds = microcicloConSesiones!.sesiones.map((s) => Number(s.id));
    const sesionesEntrenamiento = resultadoGeneracion.sesiones.filter(
      (s) => s.tipoSesion === 'ENTRENAMIENTO',
    );

    const recomendacion = await this.prisma.recomendacion.create({
      data: {
        atletaId: atletaId,
        microcicloAfectadoId: microciclo.id,
        tipo: 'INICIAL' as TipoRecomendacion,
        prioridad: 'MEDIA' as Prioridad,
        titulo: `Planificacion Microciclo ${microciclo.numeroGlobalMicrociclo} para ${atleta.usuario.nombreCompleto}`,
        mensaje: `El algoritmo ha generado ${sesionesEntrenamiento.length} sesiones de entrenamiento ` +
          `para el microciclo ${createMicrocicloDto.tipoMicrociclo}. ` +
          `Perfil del atleta: ${perfilAtleta.perfil}. ${resultadoGeneracion.justificacionGeneral}`,
        datosAnalisis: JSON.parse(JSON.stringify({
          perfilAtleta: perfilAtleta,
          tipoMicrociclo: createMicrocicloDto.tipoMicrociclo,
          ajustesAplicados: resultadoGeneracion.ajustesAplicados,
          dolenciasActivas: dolenciasActivas,
          estadoAtleta: estadoAtleta,
          fechaInicio: fechaInicio.toISOString(),
          fechaFin: fechaFin.toISOString(),
        })),
        accionSugerida: 'Revisar y aprobar las sesiones generadas para activar la planificacion',
        sesionesAfectadas: sesionesIds,
        generoSesiones: true,
        estado: 'PENDIENTE' as EstadoRecomendacion,
      },
    });

    // PASO 8: Registrar en historial (Audit Trail)
    await this.prisma.historialRecomendacion.create({
      data: {
        recomendacionId: recomendacion.id,
        estadoAnterior: null,
        estadoNuevo: 'PENDIENTE',
        usuarioId: userId,
        accion: 'CREADA',
        comentario: `Recomendacion creada automaticamente por el algoritmo. ` +
          `${sesionesEntrenamiento.length} sesiones generadas para perfil ${perfilAtleta.perfil}.`,
        datosAdicionales: {
          microcicloId: microciclo.id.toString(),
          atletaId: atletaId.toString(),
          tipoMicrociclo: createMicrocicloDto.tipoMicrociclo,
        },
      },
    });

    // PASO 9: Notificar a COMITE_TECNICO que hay una recomendacion pendiente
    // Obtener usuarios del COMITE_TECNICO
    const miembrosComite = await this.prisma.usuario.findMany({
      where: { rol: 'COMITE_TECNICO', estado: true },
      select: { id: true },
    });

    // Crear notificaciones para cada miembro
    if (miembrosComite.length > 0) {
      await this.prisma.notificacion.createMany({
        data: miembrosComite.map((miembro) => ({
          destinatarioId: miembro.id,
          recomendacionId: recomendacion.id,
          tipo: 'RECOMENDACION_ALGORITMO' as const,
          titulo: 'Nueva Planificacion Pendiente de Aprobacion',
          mensaje: `El algoritmo ha generado una planificacion para ${atleta.usuario.nombreCompleto}. ` +
            `Microciclo ${microciclo.numeroGlobalMicrociclo} (${createMicrocicloDto.tipoMicrociclo}). ` +
            `Requiere su revision y aprobacion.`,
          prioridad: 'MEDIA' as Prioridad,
        })),
      });
    }

    const response = this.formatMicrocicloResponse(microcicloConSesiones!);
    return {
      ...response,
      recomendacion: {
        id: recomendacion.id.toString(),
        estado: recomendacion.estado,
        mensaje: 'Las sesiones estan pendientes de aprobacion por COMITE_TECNICO',
      },
    } as MicrocicloResponseDto;
  }

  // Listar microciclos con filtros opcionales
  async findAll(userId: bigint, rol: string, mesocicloId?: string, page = 1, limit = 10) {
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
  async findOne(id: string, userId: bigint, rol: string): Promise<MicrocicloResponseDto> {
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
    updateMicrocicloDto: UpdateMicrocicloDto
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
          fechaFin
        );
      }
    }

    // Actualizar
    const microciclo = await this.prisma.microciclo.update({
      where: { id: BigInt(id) },
      data: {
        ...(updateMicrocicloDto.numeroMicrociclo && {
          numeroMicrociclo: updateMicrocicloDto.numeroMicrociclo,
        }),
        ...(updateMicrocicloDto.numeroGlobalMicrociclo && {
          numeroGlobalMicrociclo: updateMicrocicloDto.numeroGlobalMicrociclo,
        }),
        ...(updateMicrocicloDto.fechaInicio && {
          fechaInicio: new Date(updateMicrocicloDto.fechaInicio),
        }),
        ...(updateMicrocicloDto.fechaFin && { fechaFin: new Date(updateMicrocicloDto.fechaFin) }),
        ...(updateMicrocicloDto.tipoMicrociclo && {
          tipoMicrociclo: updateMicrocicloDto.tipoMicrociclo,
        }),
        ...(updateMicrocicloDto.volumenTotal !== undefined && {
          volumenTotal: new Prisma.Decimal(updateMicrocicloDto.volumenTotal),
        }),
        ...(updateMicrocicloDto.intensidadPromedio !== undefined && {
          intensidadPromedio: new Prisma.Decimal(updateMicrocicloDto.intensidadPromedio),
        }),
        ...(updateMicrocicloDto.objetivoSemanal && {
          objetivoSemanal: updateMicrocicloDto.objetivoSemanal,
        }),
        ...(updateMicrocicloDto.observaciones !== undefined && {
          observaciones: updateMicrocicloDto.observaciones,
        }),
        ...(updateMicrocicloDto.creadoPor && { creadoPor: updateMicrocicloDto.creadoPor }),
        ...(updateMicrocicloDto.mediaVolumen !== undefined && {
          mediaVolumen: updateMicrocicloDto.mediaVolumen
            ? new Prisma.Decimal(updateMicrocicloDto.mediaVolumen)
            : null,
        }),
        ...(updateMicrocicloDto.mediaIntensidad !== undefined && {
          mediaIntensidad: updateMicrocicloDto.mediaIntensidad
            ? new Prisma.Decimal(updateMicrocicloDto.mediaIntensidad)
            : null,
        }),
        ...(updateMicrocicloDto.sentidoVolumen !== undefined && {
          sentidoVolumen: updateMicrocicloDto.sentidoVolumen,
        }),
        ...(updateMicrocicloDto.sentidoIntensidad !== undefined && {
          sentidoIntensidad: updateMicrocicloDto.sentidoIntensidad,
        }),
        ...(updateMicrocicloDto.vCarga1 !== undefined && {
          vCarga1: updateMicrocicloDto.vCarga1
            ? new Prisma.Decimal(updateMicrocicloDto.vCarga1)
            : null,
        }),
        ...(updateMicrocicloDto.vCarga1Nivel !== undefined && {
          vCarga1Nivel: updateMicrocicloDto.vCarga1Nivel,
        }),
        ...(updateMicrocicloDto.iCarga1 !== undefined && {
          iCarga1: updateMicrocicloDto.iCarga1
            ? new Prisma.Decimal(updateMicrocicloDto.iCarga1)
            : null,
        }),
        ...(updateMicrocicloDto.iCarga1Nivel !== undefined && {
          iCarga1Nivel: updateMicrocicloDto.iCarga1Nivel,
        }),
        ...(updateMicrocicloDto.vCarga2 !== undefined && {
          vCarga2: updateMicrocicloDto.vCarga2
            ? new Prisma.Decimal(updateMicrocicloDto.vCarga2)
            : null,
        }),
        ...(updateMicrocicloDto.vCarga2Nivel !== undefined && {
          vCarga2Nivel: updateMicrocicloDto.vCarga2Nivel,
        }),
        ...(updateMicrocicloDto.iCarga2 !== undefined && {
          iCarga2: updateMicrocicloDto.iCarga2
            ? new Prisma.Decimal(updateMicrocicloDto.iCarga2)
            : null,
        }),
        ...(updateMicrocicloDto.iCarga2Nivel !== undefined && {
          iCarga2Nivel: updateMicrocicloDto.iCarga2Nivel,
        }),
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

  // Obtener informacion de eliminacion (conteo de registros hijos)
  // Usado por el frontend para mostrar advertencia antes de eliminar
  async getDeleteInfo(id: string): Promise<{
    numeroMicrociclo: number | null;
    sesiones: number;
  }> {
    const microciclo = await this.prisma.microciclo.findUnique({
      where: { id: BigInt(id) },
      select: {
        numeroMicrociclo: true,
        _count: {
          select: { sesiones: true },
        },
      },
    });

    if (!microciclo) {
      throw new NotFoundException('Microciclo no encontrado');
    }

    return {
      numeroMicrociclo: microciclo.numeroMicrociclo,
      sesiones: microciclo._count.sesiones,
    };
  }

  // Eliminar un microciclo (hard delete con cascade)
  // Las sesiones se eliminan automaticamente por CASCADE
  @Transactional()
  async remove(id: string): Promise<{ message: string; deleted: { sesiones: number } }> {
    // Obtener conteos antes de eliminar
    const deleteInfo = await this.getDeleteInfo(id);

    // Eliminar (cascade elimina sesiones)
    await this.prisma.microciclo.delete({
      where: { id: BigInt(id) },
    });

    const microcicloLabel = deleteInfo.numeroMicrociclo
      ? `#${deleteInfo.numeroMicrociclo}`
      : `ID ${id}`;

    return {
      message: `Microciclo ${microcicloLabel} eliminado permanentemente`,
      deleted: {
        sesiones: deleteInfo.sesiones,
      },
    };
  }

  // Obtener dolencias activas del atleta
  private async obtenerDolenciasActivas(atletaId: bigint): Promise<DolenciaActiva[]> {
    // Buscar dolencias no recuperadas de los ultimos 30 dias
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);

    const registros = await this.prisma.registroPostEntrenamiento.findMany({
      where: {
        atletaId,
        fechaRegistro: { gte: hace30Dias },
      },
      include: {
        dolencias: {
          where: {
            recuperado: false,
          },
        },
      },
      orderBy: { fechaRegistro: 'desc' },
    });

    // Agrupar dolencias por zona, tomando el nivel mas alto
    const dolenciasPorZona = new Map<string, number>();
    for (const registro of registros) {
      for (const dolencia of registro.dolencias) {
        const nivelActual = dolenciasPorZona.get(dolencia.zona) || 0;
        if (dolencia.nivel > nivelActual) {
          dolenciasPorZona.set(dolencia.zona, dolencia.nivel);
        }
      }
    }

    return Array.from(dolenciasPorZona.entries()).map(([zona, nivel]) => ({
      zona,
      nivel,
    }));
  }

  // Obtener estado del atleta desde post-entrenamientos recientes
  private async obtenerEstadoAtleta(atletaId: bigint): Promise<EstadoAtleta | null> {
    // Buscar ultimos 7 registros post-entrenamiento
    const registros = await this.prisma.registroPostEntrenamiento.findMany({
      where: { atletaId },
      orderBy: { fechaRegistro: 'desc' },
      take: 7,
      select: {
        rpe: true,
        calidadSueno: true,
        estadoAnimico: true,
        fechaRegistro: true,
      },
    });

    if (registros.length === 0) {
      return null;
    }

    // Calcular promedios
    const rpePromedio = registros.reduce((sum, r) => sum + (r.rpe || 5), 0) / registros.length;
    const calidadSuenoPromedio =
      registros.reduce((sum, r) => sum + (r.calidadSueno || 7), 0) / registros.length;
    const estadoAnimicoPromedio =
      registros.reduce((sum, r) => sum + (r.estadoAnimico || 7), 0) / registros.length;

    // Calcular dias desde ultimo descanso (buscar sesion de tipo DESCANSO)
    const ultimaSesionDescanso = await this.prisma.sesion.findFirst({
      where: {
        tipoSesion: 'DESCANSO',
        microciclo: {
          asignacionesAtletas: {
            some: { atletaId },
          },
        },
        fecha: { lte: new Date() },
      },
      orderBy: { fecha: 'desc' },
    });

    let diasDesdeUltimoDescanso = 0;
    if (ultimaSesionDescanso) {
      const diff = new Date().getTime() - ultimaSesionDescanso.fecha.getTime();
      diasDesdeUltimoDescanso = Math.floor(diff / (1000 * 60 * 60 * 24));
    }

    return {
      rpePromedio,
      calidadSuenoPromedio,
      estadoAnimicoPromedio,
      diasDesdeUltimoDescanso,
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
      mediaIntensidad: microciclo.mediaIntensidad
        ? parseFloat(microciclo.mediaIntensidad.toString())
        : null,
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
