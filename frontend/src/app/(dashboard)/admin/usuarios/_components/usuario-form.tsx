'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  crearUsuarioSchema,
  rolesUsuario,
  type CrearUsuarioInput,
  type Usuario,
} from '@/lib/usuarios-schema';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { crearUsuarioAction } from '../_actions/crear-usuario';
import { editarUsuarioAction } from '../_actions/editar-usuario';
import { toast } from 'sonner';

interface UsuarioFormProps {
  usuario?: Usuario;
  onSuccess?: () => void;
}

export function UsuarioForm({ usuario, onSuccess }: UsuarioFormProps) {
  const [isPending, setIsPending] = useState(false);
  const isEditing = !!usuario;

  const form = useForm<CrearUsuarioInput>({
    resolver: zodResolver(crearUsuarioSchema),
    defaultValues: usuario
      ? {
          ci: usuario.ci,
          nombreCompleto: usuario.nombreCompleto,
          email: usuario.email,
          contrasena: '', // No mostramos la contraseña actual
          rol: usuario.rol,
          estado: usuario.estado,
        }
      : {
          ci: '',
          nombreCompleto: '',
          email: '',
          contrasena: '',
          rol: 'ATLETA',
          estado: true,
        },
  });

  const onSubmit = async (data: CrearUsuarioInput) => {
    setIsPending(true);

    try {
      let result;

      if (isEditing) {
        // Si estamos editando, solo enviamos los campos modificados
        const updateData: Record<string, unknown> = {};

        if (data.ci !== usuario.ci) updateData.ci = data.ci;
        if (data.nombreCompleto !== usuario.nombreCompleto)
          updateData.nombreCompleto = data.nombreCompleto;
        if (data.email !== usuario.email) updateData.email = data.email;
        if (data.contrasena) updateData.contrasena = data.contrasena; // Solo si se proporciona
        if (data.rol !== usuario.rol) updateData.rol = data.rol;
        if (data.estado !== usuario.estado) updateData.estado = data.estado;

        result = await editarUsuarioAction(usuario.id, updateData);
      } else {
        // Si estamos creando, enviamos todos los datos
        result = await crearUsuarioAction(data);
      }

      if (result.success) {
        toast.success(
          isEditing
            ? `Usuario ${data.nombreCompleto} actualizado`
            : `Usuario ${data.nombreCompleto} creado`,
          {
            description: isEditing
              ? 'Los cambios se han guardado correctamente'
              : 'El usuario ha sido creado exitosamente',
          }
        );

        if (!isEditing) {
          form.reset();
        }
        onSuccess?.();
      } else {
        toast.error(result.error || 'Error desconocido', {
          description: 'Por favor intenta nuevamente',
        });
      }
    } catch (error) {
      toast.error('Error inesperado', {
        description: 'No pudimos procesar tu solicitud',
      });
      console.error(error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* CI */}
        <FormField
          control={form.control}
          name="ci"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CI</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: 12345678"
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Nombre Completo */}
        <FormField
          control={form.control}
          name="nombreCompleto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre Completo</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: Juan Perez Rodriguez"
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Ej: usuario@addjc.com"
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Contraseña */}
        <FormField
          control={form.control}
          name="contrasena"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {isEditing ? 'Nueva Contraseña (opcional)' : 'Contraseña'}
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={
                    isEditing
                      ? 'Dejar en blanco para no cambiar'
                      : 'Minimo 8 caracteres'
                  }
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Rol */}
        <FormField
          control={form.control}
          name="rol"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rol</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isPending}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {rolesUsuario.map((rol) => (
                    <SelectItem key={rol} value={rol}>
                      {rol.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Estado */}
        <FormField
          control={form.control}
          name="estado"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Estado</FormLabel>
                <div className="text-sm text-muted-foreground">
                  {field.value ? 'Usuario activo' : 'Usuario inactivo'}
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isPending}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Botón Submit */}
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending
            ? isEditing
              ? 'Actualizando...'
              : 'Creando...'
            : isEditing
              ? 'Actualizar Usuario'
              : 'Crear Usuario'}
        </Button>
      </form>
    </Form>
  );
}
