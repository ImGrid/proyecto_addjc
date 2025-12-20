// DTO para respuestas (incluye datos del usuario asociado y atletas)
// BigInt se convierte automaticamente a string por BigIntTransformInterceptor
export interface EntrenadorResponseDto {
  id: bigint;
  usuarioId: bigint;
  municipio: string;
  especialidad: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Datos del usuario asociado
  usuario: {
    id: bigint;
    ci: string;
    nombreCompleto: string;
    email: string;
    estado: boolean;
  };

  // Atletas asignados (opcional, solo cuando se solicite)
  atletasAsignados?: Array<{
    id: bigint;
    nombreCompleto: string;
    club: string;
    categoria: string;
  }>;
}
