import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, QueryUserDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMINISTRADOR') // Solo el ADMINISTRADOR puede gestionar usuarios
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // POST /api/users - Crear un nuevo usuario
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // GET /api/users - Listar usuarios con filtros y paginación
  @Get()
  findAll(@Query() queryDto: QueryUserDto) {
    return this.usersService.findAll(queryDto);
  }

  // GET /api/users/:id - Obtener un usuario por ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // PATCH /api/users/:id - Actualizar un usuario (incluye soft delete)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  // PATCH /api/users/:id/deactivate - Soft delete (desactivar)
  @Patch(':id/deactivate')
  softDelete(@Param('id') id: string) {
    return this.usersService.softDelete(id);
  }

  // DELETE /api/users/:id - Hard delete (borrar permanentemente)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    // Log de auditoría: se podría registrar quién eliminó a quién
    return this.usersService.remove(id);
  }
}
