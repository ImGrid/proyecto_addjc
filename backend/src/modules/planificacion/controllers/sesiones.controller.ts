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
  ParseIntPipe,
} from '@nestjs/common';
import { SesionesService } from '../services/sesiones.service';
import { CreateSesionDto, UpdateSesionDto } from '../dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

@Controller('sesiones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SesionesController {
  constructor(private readonly sesionesService: SesionesService) {}

  // POST /api/sesiones - Crear sesión (COMITE_TECNICO, ENTRENADOR)
  @Post()
  @Roles('COMITE_TECNICO', 'ENTRENADOR')
  create(@Body() createSesionDto: CreateSesionDto) {
    return this.sesionesService.create(createSesionDto);
  }

  // GET /api/sesiones - Listar sesiones (todos los roles autenticados)
  @Get()
  @Roles('COMITE_TECNICO', 'ENTRENADOR', 'ATLETA')
  findAll(
    @Query('microcicloId') microcicloId?: string,
    @Query('fecha') fecha?: string,
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
  ) {
    return this.sesionesService.findAll(microcicloId, fecha, page, limit);
  }

  // GET /api/sesiones/:id - Obtener sesión por ID
  @Get(':id')
  @Roles('COMITE_TECNICO', 'ENTRENADOR', 'ATLETA')
  findOne(@Param('id') id: string) {
    return this.sesionesService.findOne(id);
  }

  // PATCH /api/sesiones/:id - Actualizar sesión (COMITE_TECNICO, ENTRENADOR)
  @Patch(':id')
  @Roles('COMITE_TECNICO', 'ENTRENADOR')
  update(
    @Param('id') id: string,
    @Body() updateSesionDto: UpdateSesionDto,
  ) {
    return this.sesionesService.update(id, updateSesionDto);
  }

  // DELETE /api/sesiones/:id - Eliminar sesión (solo COMITE_TECNICO)
  @Delete(':id')
  @Roles('COMITE_TECNICO')
  remove(@Param('id') id: string) {
    return this.sesionesService.remove(id);
  }
}
