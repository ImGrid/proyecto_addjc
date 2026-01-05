import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import {
  DiaSemana,
  TipoSesion,
  Turno,
  TipoPlanificacion,
  CreadoPor,
} from '@prisma/client';

export class CreateSesionDto {
  @IsString()
  @IsNotEmpty()
  microcicloId!: string; // BigInt como string desde el cliente

  @IsDateString()
  @IsNotEmpty()
  fecha!: string;

  @IsEnum(DiaSemana)
  @IsNotEmpty()
  diaSemana!: DiaSemana;

  @IsInt()
  @Min(1)
  @Max(7)
  numeroSesion!: number;

  @IsEnum(TipoSesion)
  @IsNotEmpty()
  tipoSesion!: TipoSesion;

  @IsEnum(Turno)
  @IsOptional()
  turno?: Turno; // Default: COMPLETO

  @IsEnum(TipoPlanificacion)
  @IsOptional()
  tipoPlanificacion?: TipoPlanificacion; // Default: INICIAL

  @IsString()
  @IsOptional()
  sesionBaseId?: string; // BigInt como string (para ajustes)

  @IsEnum(CreadoPor)
  @IsOptional()
  creadoPor?: CreadoPor; // Default: COMITE_TECNICO

  // Planificación
  @IsInt()
  @Min(1)
  duracionPlanificada!: number; // En minutos (requerido siempre)

  // Opcionales para COMPETENCIA/DESCANSO
  @IsInt()
  @Min(0)
  @IsOptional()
  volumenPlanificado?: number;

  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  intensidadPlanificada?: number; // Porcentaje

  @IsInt()
  @Min(40)
  @Max(220)
  @IsOptional()
  fcObjetivo?: number; // Frecuencia cardíaca objetivo

  @IsString()
  @MaxLength(20)
  @IsOptional()
  relacionVI?: string; // Relación volumen-intensidad

  @IsString()
  @MaxLength(50)
  @IsOptional()
  zonaEsfuerzo?: string;

  // Datos reales (se llenan después de la sesión)
  @IsInt()
  @Min(0)
  @IsOptional()
  duracionReal?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  volumenReal?: number;

  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  intensidadReal?: number;

  // Contenidos (opcionales para COMPETENCIA/DESCANSO)
  @IsString()
  @IsOptional()
  contenidoFisico?: string;

  @IsString()
  @IsOptional()
  contenidoTecnico?: string;

  @IsString()
  @IsOptional()
  contenidoTactico?: string;

  // Estructura de sesión (opcionales)
  @IsString()
  @IsOptional()
  calentamiento?: string;

  @IsString()
  @IsOptional()
  partePrincipal?: string;

  @IsString()
  @IsOptional()
  vueltaCalma?: string;

  // Observaciones
  @IsString()
  @IsOptional()
  observaciones?: string;

  @IsString()
  @IsOptional()
  materialNecesario?: string;
}
