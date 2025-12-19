import { IsOptional, IsBoolean, IsString, MaxLength } from 'class-validator';

export class UpdateAsignacionDto {
  @IsOptional()
  @IsBoolean({ message: 'El campo activa debe ser un booleano' })
  activa?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Las observaciones no pueden exceder 500 caracteres' })
  observaciones?: string;
}
