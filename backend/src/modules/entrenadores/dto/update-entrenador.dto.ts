import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateEntrenadorDto {
  // Datos del entrenador (todos opcionales en update)
  @IsString()
  @MaxLength(100)
  @IsOptional()
  municipio?: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  especialidad?: string;
}
