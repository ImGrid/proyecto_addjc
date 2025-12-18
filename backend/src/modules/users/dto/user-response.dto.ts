import { RolUsuario } from '@prisma/client';

// DTO para respuestas (NO incluye la contraseña)
export interface UserResponseDto {
  id: string; // BigInt convertido a string para JSON
  ci: string;
  nombreCompleto: string;
  email: string;
  rol: RolUsuario;
  estado: boolean;
  fechaRegistro: Date;
  ultimoAcceso: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
