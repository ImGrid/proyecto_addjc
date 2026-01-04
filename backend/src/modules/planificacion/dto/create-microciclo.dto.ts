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
import { Transform } from 'class-transformer';
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

  @Transform(({ value }) => (value ? parseFloat(value) : null))
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Volumen total debe ser un numero' })
  @Min(0)
  volumenTotal!: number;

  @Transform(({ value }) => (value ? parseFloat(value) : null))
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Intensidad promedio debe ser un numero' })
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
  @Transform(({ value }) => (value ? parseFloat(value) : null))
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Media volumen debe ser un numero' })
  @IsOptional()
  mediaVolumen?: number;

  @Transform(({ value }) => (value ? parseFloat(value) : null))
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Media intensidad debe ser un numero' })
  @IsOptional()
  mediaIntensidad?: number;

  @IsEnum(SentidoCarga)
  @IsOptional()
  sentidoVolumen?: SentidoCarga;

  @IsEnum(SentidoCarga)
  @IsOptional()
  sentidoIntensidad?: SentidoCarga;

  // Cargas semanales (opcionales)
  @Transform(({ value }) => (value ? parseFloat(value) : null))
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'vCarga1 debe ser un numero' })
  @IsOptional()
  vCarga1?: number;

  @IsInt()
  @IsOptional()
  vCarga1Nivel?: number;

  @Transform(({ value }) => (value ? parseFloat(value) : null))
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'iCarga1 debe ser un numero' })
  @IsOptional()
  iCarga1?: number;

  @IsInt()
  @IsOptional()
  iCarga1Nivel?: number;

  @Transform(({ value }) => (value ? parseFloat(value) : null))
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'vCarga2 debe ser un numero' })
  @IsOptional()
  vCarga2?: number;

  @IsInt()
  @IsOptional()
  vCarga2Nivel?: number;

  @Transform(({ value }) => (value ? parseFloat(value) : null))
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'iCarga2 debe ser un numero' })
  @IsOptional()
  iCarga2?: number;

  @IsInt()
  @IsOptional()
  iCarga2Nivel?: number;
}
