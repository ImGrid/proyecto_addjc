import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { TipoMicrociclo, CreadoPor, SentidoCarga } from '@prisma/client';

export class CreateMicrocicloDto {
  @IsString()
  @IsOptional()
  mesocicloId?: string; // BigInt como string (opcional en v1.0)

  @IsInt()
  @Min(1)
  @IsOptional()
  numeroMicrociclo?: number; // Opcional si no hay mesociclo

  @IsInt()
  @Min(1)
  numeroGlobalMicrociclo!: number; // Número global único

  @IsDateString()
  @IsNotEmpty()
  fechaInicio!: string;

  @IsDateString()
  @IsNotEmpty()
  fechaFin!: string;

  @IsEnum(TipoMicrociclo)
  @IsNotEmpty()
  tipoMicrociclo!: TipoMicrociclo;

  @IsNumber()
  @Min(0)
  volumenTotal!: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  intensidadPromedio!: number;

  @IsString()
  @IsNotEmpty()
  objetivoSemanal!: string;

  @IsString()
  @IsOptional()
  observaciones?: string;

  @IsEnum(CreadoPor)
  @IsOptional()
  creadoPor?: CreadoPor; // Default: COMITE_TECNICO

  // Campos de carga (opcionales - calculados automáticamente)
  @IsNumber()
  @IsOptional()
  mediaVolumen?: number;

  @IsNumber()
  @IsOptional()
  mediaIntensidad?: number;

  @IsEnum(SentidoCarga)
  @IsOptional()
  sentidoVolumen?: SentidoCarga;

  @IsEnum(SentidoCarga)
  @IsOptional()
  sentidoIntensidad?: SentidoCarga;

  // Cargas semanales (opcionales)
  @IsNumber()
  @IsOptional()
  vCarga1?: number;

  @IsInt()
  @IsOptional()
  vCarga1Nivel?: number;

  @IsNumber()
  @IsOptional()
  iCarga1?: number;

  @IsInt()
  @IsOptional()
  iCarga1Nivel?: number;

  @IsNumber()
  @IsOptional()
  vCarga2?: number;

  @IsInt()
  @IsOptional()
  vCarga2Nivel?: number;

  @IsNumber()
  @IsOptional()
  iCarga2?: number;

  @IsInt()
  @IsOptional()
  iCarga2Nivel?: number;
}
