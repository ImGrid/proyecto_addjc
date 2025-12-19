import { z } from 'zod';

// Enum de roles (DEBE coincidir EXACTAMENTE con Prisma RolUsuario)
export const rolesUsuario = [
  'ADMINISTRADOR',
  'COMITE_TECNICO',
  'ENTRENADOR',
  'ATLETA',
] as const;

export type RolUsuario = (typeof rolesUsuario)[number];

// Schema para crear usuario (coincide con CreateUserDto del backend)
export const crearUsuarioSchema = z.object({
  ci: z
    .string()
    .min(5, 'CI debe tener al menos 5 caracteres')
    .max(20, 'CI no puede tener más de 20 caracteres')
    .trim(),
  nombreCompleto: z
    .string()
    .min(3, 'Nombre debe tener al menos 3 caracteres')
    .max(255, 'Nombre no puede tener más de 255 caracteres')
    .trim(),
  email: z
    .string()
    .email('Email inválido')
    .max(255, 'Email no puede tener más de 255 caracteres')
    .toLowerCase()
    .trim(),
  contrasena: z
    .string()
    .min(8, 'Contraseña debe tener al menos 8 caracteres')
    .max(100, 'Contraseña no puede tener más de 100 caracteres'),
  rol: z.enum(rolesUsuario),
  estado: z.boolean().optional(),
});

// Schema para editar usuario (coincide con UpdateUserDto del backend)
// Todos los campos son opcionales excepto el ID
export const editarUsuarioSchema = z.object({
  id: z.string(),
  ci: z
    .string()
    .min(5, 'CI debe tener al menos 5 caracteres')
    .max(20, 'CI no puede tener más de 20 caracteres')
    .trim()
    .optional(),
  nombreCompleto: z
    .string()
    .min(3, 'Nombre debe tener al menos 3 caracteres')
    .max(255, 'Nombre no puede tener más de 255 caracteres')
    .trim()
    .optional(),
  email: z
    .string()
    .email('Email inválido')
    .max(255, 'Email no puede tener más de 255 caracteres')
    .toLowerCase()
    .trim()
    .optional(),
  contrasena: z
    .string()
    .min(8, 'Contraseña debe tener al menos 8 caracteres')
    .max(100, 'Contraseña no puede tener más de 100 caracteres')
    .optional(),
  rol: z.enum(rolesUsuario).optional(),
  estado: z.boolean().optional(),
});

// Schema para respuesta del servidor (coincide con UserResponseDto)
export const usuarioResponseSchema = z.object({
  id: z.string(),
  ci: z.string(),
  nombreCompleto: z.string(),
  email: z.string().email(),
  rol: z.enum(rolesUsuario),
  estado: z.boolean(),
  fechaRegistro: z.coerce.date(),
  ultimoAcceso: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const usuariosListSchema = z.object({
  data: z.array(usuarioResponseSchema),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
});

// Tipos inferidos automáticamente
export type CrearUsuarioInput = z.infer<typeof crearUsuarioSchema>;
export type EditarUsuarioInput = z.infer<typeof editarUsuarioSchema>;
export type Usuario = z.infer<typeof usuarioResponseSchema>;
export type UsuariosList = z.infer<typeof usuariosListSchema>;
