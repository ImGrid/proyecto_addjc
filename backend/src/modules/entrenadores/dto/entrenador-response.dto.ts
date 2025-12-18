// DTO para respuestas (incluye datos del usuario asociado y atletas)
export interface EntrenadorResponseDto {
  id: string; // BigInt convertido a string
  usuarioId: string;
  municipio: string;
  especialidad: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Datos del usuario asociado
  usuario: {
    id: string;
    ci: string;
    nombreCompleto: string;
    email: string;
    estado: boolean;
  };

  // Atletas asignados (opcional, solo cuando se solicite)
  atletasAsignados?: Array<{
    id: string;
    nombreCompleto: string;
    club: string;
    categoria: string;
  }>;
}
