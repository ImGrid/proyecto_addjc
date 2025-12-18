import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RolUsuario } from '@prisma/client';

@Injectable()
export class AtletaOwnershipGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Agregado por JwtAuthGuard

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // Extraer atletaId del body o params
    const atletaId = BigInt(
      request.body?.atletaId || request.params?.atletaId || 0,
    );

    if (!atletaId) {
      throw new ForbiddenException(
        'ID de atleta no proporcionado en la solicitud',
      );
    }

    // COMITE_TECNICO y ADMINISTRADOR pueden ver/modificar todos los atletas
    if (
      user.rol === RolUsuario.COMITE_TECNICO ||
      user.rol === RolUsuario.ADMINISTRADOR
    ) {
      return true;
    }

    // ENTRENADOR: verificar relacion con atleta asignado
    if (user.rol === RolUsuario.ENTRENADOR) {
      // Buscar el entrenador por usuarioId
      const entrenador = await this.prisma.entrenador.findUnique({
        where: { usuarioId: user.id },
        include: {
          atletasAsignados: {
            where: { id: atletaId },
            select: { id: true },
          },
        },
      });

      // Verificar que el atleta esta en la lista de asignados
      if (!entrenador || entrenador.atletasAsignados.length === 0) {
        throw new ForbiddenException(
          `No tienes permiso para registrar datos del atleta ${atletaId}. Solo puedes registrar datos de tus atletas asignados.`,
        );
      }

      return true;
    }

    // ATLETA no puede registrar datos de otros
    if (user.rol === RolUsuario.ATLETA) {
      throw new ForbiddenException(
        'Los atletas no tienen permiso para registrar datos post-entrenamiento',
      );
    }

    return false;
  }
}
