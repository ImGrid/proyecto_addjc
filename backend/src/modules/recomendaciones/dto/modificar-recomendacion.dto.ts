// DTO para modificar una recomendacion del algoritmo antes de aplicarla
// El COMITE_TECNICO puede ajustar valores antes de aprobar

import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsObject,
  IsNumber,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// Ajustes que el COMITE puede hacer a una sesion
export class AjusteSesionDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(300)
  duracionPlanificada?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  volumenPlanificado?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  intensidadPlanificada?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  contenidoFisico?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  contenidoTecnico?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  contenidoTactico?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  partePrincipal?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observaciones?: string;
}

// Modificaciones aplicadas a la recomendacion
export class ModificacionesDto {
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => AjusteSesionDto)
  ajustesSesion?: AjusteSesionDto;

  // Para ajustes globales del microciclo
  @IsOptional()
  @IsNumber()
  @Min(-50)
  @Max(50)
  ajusteVolumenGlobal?: number;

  @IsOptional()
  @IsNumber()
  @Min(-50)
  @Max(50)
  ajusteIntensidadGlobal?: number;
}

export class ModificarRecomendacionDto {
  @IsNotEmpty({ message: 'Las modificaciones son requeridas' })
  @IsObject()
  @ValidateNested()
  @Type(() => ModificacionesDto)
  modificaciones!: ModificacionesDto;

  @IsNotEmpty({ message: 'La justificacion de modificacion es requerida' })
  @IsString()
  @MaxLength(1000)
  justificacion!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  comentarioAdicional?: string;
}
