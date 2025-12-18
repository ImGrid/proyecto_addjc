import { Injectable } from '@nestjs/common';
import {
  DiaSemana,
  TipoSesion,
  Turno,
  TipoPlanificacion,
  CreadoPor,
} from '@prisma/client';

export interface SesionTemplate {
  numeroSesion: number;
  diaSemana: DiaSemana;
  fecha: Date;
  tipoSesion: TipoSesion;
  turno: Turno;
  duracionPlanificada: number;
  volumenPlanificado: number;
  intensidadPlanificada: number;
  relacionVI: string;
  contenidoFisico: string;
  contenidoTecnico: string;
  contenidoTactico: string;
  tipoPlanificacion: TipoPlanificacion;
  creadoPor: CreadoPor;
}

@Injectable()
export class SesionFactory {
  // Genera 7 sesiones para un microciclo basado en fechas
  // Patrón 3-1-2-1: 3 días carga + 1 recuperación + 2 carga + 1 recuperación
  generateWeeklySessions(
    fechaInicio: Date,
    objetivoSemanal: string,
  ): SesionTemplate[] {
    const sessions: SesionTemplate[] = [];
    const diasSemana: DiaSemana[] = [
      'LUNES',
      'MARTES',
      'MIERCOLES',
      'JUEVES',
      'VIERNES',
      'SABADO',
      'DOMINGO',
    ];

    // Patrón de carga/recuperación basado en documentación (3-1-2-1)
    // Lunes, Martes: Carga (alta intensidad)
    // Miércoles: Recuperación
    // Jueves, Viernes: Carga
    // Sábado: Posible competencia o carga moderada
    // Domingo: Recuperación/Descanso

    for (let i = 0; i < 7; i++) {
      const fecha = new Date(fechaInicio);
      fecha.setDate(fecha.getDate() + i);

      const diaSemana = diasSemana[i];
      const numeroSesion = i + 1;

      // Determinar tipo de sesión basado en el patrón
      let tipoSesion: TipoSesion;
      let duracionPlanificada: number;
      let volumenPlanificado: number;
      let intensidadPlanificada: number;
      let relacionVI: string;

      switch (diaSemana) {
        case 'LUNES':
        case 'MARTES':
          // Días de carga alta
          tipoSesion = 'ENTRENAMIENTO';
          duracionPlanificada = 120; // 2 horas
          volumenPlanificado = 80;
          intensidadPlanificada = 75;
          relacionVI = 'ALTO-MEDIO';
          break;

        case 'MIERCOLES':
          // Día de recuperación
          tipoSesion = 'RECUPERACION';
          duracionPlanificada = 60; // 1 hora
          volumenPlanificado = 40;
          intensidadPlanificada = 40;
          relacionVI = 'BAJO-BAJO';
          break;

        case 'JUEVES':
        case 'VIERNES':
          // Días de carga moderada-alta
          tipoSesion = 'ENTRENAMIENTO';
          duracionPlanificada = 100; // 1h 40min
          volumenPlanificado = 70;
          intensidadPlanificada = 70;
          relacionVI = 'MEDIO-MEDIO';
          break;

        case 'SABADO':
          // Posible competencia o entrenamiento moderado
          tipoSesion = 'ENTRENAMIENTO';
          duracionPlanificada = 90; // 1h 30min
          volumenPlanificado = 60;
          intensidadPlanificada = 65;
          relacionVI = 'MEDIO-MEDIO';
          break;

        case 'DOMINGO':
          // Día de descanso/recuperación
          tipoSesion = 'DESCANSO';
          duracionPlanificada = 0;
          volumenPlanificado = 0;
          intensidadPlanificada = 0;
          relacionVI = 'BAJO-BAJO';
          break;

        default:
          tipoSesion = 'ENTRENAMIENTO';
          duracionPlanificada = 90;
          volumenPlanificado = 60;
          intensidadPlanificada = 60;
          relacionVI = 'MEDIO-MEDIO';
      }

      sessions.push({
        numeroSesion,
        diaSemana,
        fecha,
        tipoSesion,
        turno: 'COMPLETO',
        duracionPlanificada,
        volumenPlanificado,
        intensidadPlanificada,
        relacionVI,
        contenidoFisico: `Contenido físico para ${diaSemana} - ${objetivoSemanal}`,
        contenidoTecnico: `Contenido técnico para ${diaSemana}`,
        contenidoTactico: `Contenido táctico para ${diaSemana}`,
        tipoPlanificacion: 'INICIAL',
        creadoPor: 'SISTEMA_ALGORITMO',
      });
    }

    return sessions;
  }
}
