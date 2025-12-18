import { IsString, IsNotEmpty, MinLength, MaxLength, IsDateString, IsEnum, IsInt, Min, IsOptional } from 'class-validator';
import { EtapaMesociclo } from '@prisma/client';

export class CreateMesocicloDto {
  @IsString()
  @IsNotEmpty()
  macrocicloId!: string; // BigInt como string desde el cliente

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  nombre!: string;

  @IsInt()
  @Min(1)
  numeroMesociclo!: number;

  @IsEnum(EtapaMesociclo)
  @IsNotEmpty()
  etapa!: EtapaMesociclo;

  @IsDateString()
  @IsNotEmpty()
  fechaInicio!: string;

  @IsDateString()
  @IsNotEmpty()
  fechaFin!: string;

  @IsString()
  @IsNotEmpty()
  objetivoFisico!: string;

  @IsString()
  @IsNotEmpty()
  objetivoTecnico!: string;

  @IsString()
  @IsNotEmpty()
  objetivoTactico!: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  totalMicrociclos?: number;
}
