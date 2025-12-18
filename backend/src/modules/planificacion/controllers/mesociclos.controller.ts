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
import { MesociclosService } from '../services/mesociclos.service';
import { CreateMesocicloDto, UpdateMesocicloDto } from '../dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

@Controller('mesociclos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MesociclosController {
  constructor(private readonly mesociclosService: MesociclosService) {}

  // POST /api/mesociclos - Crear mesociclo (solo COMITE_TECNICO)
  @Post()
  @Roles('COMITE_TECNICO')
  create(@Body() createMesocicloDto: CreateMesocicloDto) {
    return this.mesociclosService.create(createMesocicloDto);
  }

  // GET /api/mesociclos - Listar mesociclos (COMITE_TECNICO, ENTRENADOR)
  @Get()
  @Roles('COMITE_TECNICO', 'ENTRENADOR')
  findAll(
    @Query('macrocicloId') macrocicloId?: string,
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
  ) {
    return this.mesociclosService.findAll(macrocicloId, page, limit);
  }

  // GET /api/mesociclos/:id - Obtener mesociclo por ID
  @Get(':id')
  @Roles('COMITE_TECNICO', 'ENTRENADOR')
  findOne(@Param('id') id: string) {
    return this.mesociclosService.findOne(id);
  }

  // PATCH /api/mesociclos/:id - Actualizar mesociclo (solo COMITE_TECNICO)
  @Patch(':id')
  @Roles('COMITE_TECNICO')
  update(
    @Param('id') id: string,
    @Body() updateMesocicloDto: UpdateMesocicloDto,
  ) {
    return this.mesociclosService.update(id, updateMesocicloDto);
  }

  // DELETE /api/mesociclos/:id - Eliminar mesociclo (solo COMITE_TECNICO)
  @Delete(':id')
  @Roles('COMITE_TECNICO')
  remove(@Param('id') id: string) {
    return this.mesociclosService.remove(id);
  }
}
