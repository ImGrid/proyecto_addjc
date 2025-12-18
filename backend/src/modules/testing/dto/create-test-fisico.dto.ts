import {
  IsInt,
  IsOptional,
  IsString,
  IsDateString,
  IsNumber,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateTestFisicoDto {
  // IDs de relaciones
  @IsInt({ message: 'El ID del atleta debe ser un numero entero' })
  @Type(() => Number)
  atletaId!: number;

  @IsOptional()
  @IsInt({ message: 'El ID de la sesion debe ser un numero entero' })
  @Type(() => Number)
  sesionId?: number;

  @IsOptional()
  @IsInt({ message: 'El ID del microciclo debe ser un numero entero' })
  @Type(() => Number)
  microcicloId?: number;

  // Fecha del test
  @IsDateString({}, { message: 'La fecha del test debe ser una fecha valida' })
  fechaTest!: string;

  // Tests de fuerza maxima (1RM) - kg
  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(value) : null))
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Press banca debe ser un numero' },
  )
  @Min(0, { message: 'Press banca no puede ser negativo' })
  @Max(300, { message: 'Press banca no puede exceder 300 kg' })
  pressBanca?: number;

  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(value) : null))
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Tiron debe ser un numero' })
  @Min(0, { message: 'Tiron no puede ser negativo' })
  @Max(400, { message: 'Tiron no puede exceder 400 kg' })
  tiron?: number;

  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(value) : null))
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Sentadilla debe ser un numero' },
  )
  @Min(0, { message: 'Sentadilla no puede ser negativo' })
  @Max(400, { message: 'Sentadilla no puede exceder 400 kg' })
  sentadilla?: number;

  // Tests de fuerza resistencia - repeticiones
  @IsOptional()
  @IsInt({ message: 'Barra fija debe ser un numero entero' })
  @Min(0, { message: 'Barra fija no puede ser negativo' })
  @Max(100, { message: 'Barra fija no puede exceder 100 repeticiones' })
  barraFija?: number;

  @IsOptional()
  @IsInt({ message: 'Paralelas debe ser un numero entero' })
  @Min(0, { message: 'Paralelas no puede ser negativo' })
  @Max(100, { message: 'Paralelas no puede exceder 100 repeticiones' })
  paralelas?: number;

  // Tests de resistencia aerobica
  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(value) : null))
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Navette palier debe ser un numero' },
  )
  @Min(0, { message: 'Navette palier no puede ser negativo' })
  @Max(20, { message: 'Navette palier no puede exceder 20' })
  navettePalier?: number;

  @IsOptional()
  @IsString({ message: 'Test 1500m debe ser una hora valida (HH:MM:SS)' })
  test1500m?: string; // Formato: "HH:MM:SS" o "MM:SS"

  // Observaciones
  @IsOptional()
  @IsString()
  @MaxLength(1000, {
    message: 'Las observaciones no pueden exceder 1000 caracteres',
  })
  observaciones?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, {
    message: 'Las condiciones del test no pueden exceder 500 caracteres',
  })
  condicionesTest?: string;
}
