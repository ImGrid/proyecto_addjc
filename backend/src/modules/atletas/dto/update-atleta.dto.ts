import { IsString, IsInt, IsEnum, IsOptional, IsDateString, MaxLength, Min, IsDecimal } from 'class-validator';
import { CategoriaPeso } from '@prisma/client';

export class UpdateAtletaDto {
  // Datos del atleta (todos opcionales en update)
  @IsString()
  @MaxLength(100)
  @IsOptional()
  municipio?: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  club?: string;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  categoria?: string;

  @IsString()
  @MaxLength(20)
  @IsOptional()
  peso?: string;

  @IsDateString()
  @IsOptional()
  fechaNacimiento?: string;

  @IsInt()
  @Min(5)
  @IsOptional()
  edad?: number;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  telefono?: string;

  @IsString()
  @IsOptional()
  entrenadorAsignadoId?: string; // BigInt convertido a string

  @IsEnum(CategoriaPeso)
  @IsOptional()
  categoriaPeso?: CategoriaPeso;

  @IsDecimal()
  @IsOptional()
  pesoActual?: number;

  @IsInt()
  @IsOptional()
  fcReposo?: number;
}
