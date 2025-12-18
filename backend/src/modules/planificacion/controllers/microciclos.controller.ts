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
import { MicrociclosService } from '../services/microciclos.service';
import { CreateMicrocicloDto, UpdateMicrocicloDto } from '../dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

@Controller('microciclos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MicrociclosController {
  constructor(private readonly microciclosService: MicrociclosService) {}

  // POST /api/microciclos - Crear microciclo (COMITE_TECNICO, ENTRENADOR)
  // Genera automáticamente 7 sesiones
  @Post()
  @Roles('COMITE_TECNICO', 'ENTRENADOR')
  create(@Body() createMicrocicloDto: CreateMicrocicloDto) {
    return this.microciclosService.create(createMicrocicloDto);
  }

  // GET /api/microciclos - Listar microciclos (todos los roles autenticados)
  @Get()
  @Roles('COMITE_TECNICO', 'ENTRENADOR', 'ATLETA')
  findAll(
    @Query('mesocicloId') mesocicloId?: string,
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
  ) {
    return this.microciclosService.findAll(mesocicloId, page, limit);
  }

  // GET /api/microciclos/:id - Obtener microciclo por ID (con sus 7 sesiones)
  @Get(':id')
  @Roles('COMITE_TECNICO', 'ENTRENADOR', 'ATLETA')
  findOne(@Param('id') id: string) {
    return this.microciclosService.findOne(id);
  }

  // PATCH /api/microciclos/:id - Actualizar microciclo (COMITE_TECNICO, ENTRENADOR)
  @Patch(':id')
  @Roles('COMITE_TECNICO', 'ENTRENADOR')
  update(
    @Param('id') id: string,
    @Body() updateMicrocicloDto: UpdateMicrocicloDto,
  ) {
    return this.microciclosService.update(id, updateMicrocicloDto);
  }

  // DELETE /api/microciclos/:id - Eliminar microciclo (solo COMITE_TECNICO)
  // Las 7 sesiones se eliminan automáticamente en cascada
  @Delete(':id')
  @Roles('COMITE_TECNICO')
  remove(@Param('id') id: string) {
    return this.microciclosService.remove(id);
  }
}
