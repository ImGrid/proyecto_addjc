import { IsString, IsEmail, IsInt, IsEnum, IsOptional, IsDateString, MinLength, MaxLength, Min, IsDecimal } from 'class-validator';
import { CategoriaPeso } from '@prisma/client';

export class CreateAtletaDto {
  // Datos del usuario (se crea automaticamente con rol ATLETA)
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  ci!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(255)
  nombreCompleto!: string;

  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  contrasena!: string;

  // Datos del atleta
  @IsString()
  @MaxLength(100)
  municipio!: string;

  @IsString()
  @MaxLength(100)
  club!: string;

  @IsString()
  @MaxLength(50)
  categoria!: string;

  @IsString()
  @MaxLength(20)
  peso!: string;

  @IsDateString()
  fechaNacimiento!: string;

  @IsInt()
  @Min(5)
  edad!: number;

  // Campos opcionales
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
