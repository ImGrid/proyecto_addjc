import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { MacrociclosController } from './controllers/macrociclos.controller';
import { MesociclosController } from './controllers/mesociclos.controller';
import { MicrociclosController } from './controllers/microciclos.controller';
import { SesionesController } from './controllers/sesiones.controller';
import { MacrociclosService } from './services/macrociclos.service';
import { MesociclosService } from './services/mesociclos.service';
import { MicrociclosService } from './services/microciclos.service';
import { SesionesService } from './services/sesiones.service';
import { SesionFactory } from './services/sesion.factory';
import { DateRangeValidator } from './validators/date-range.validator';
import { PrismaService } from '../../database/prisma.service';
import { CatalogoEjerciciosService } from '../algoritmo/services/catalogo-ejercicios.service';

// Módulo de Planificación Deportiva
// Incluye: Macrociclos, Mesociclos, Microciclos y Sesiones
@Module({
  imports: [
    DatabaseModule, // Para PrismaService
    AuthModule,     // Para autenticación y autorización
  ],
  controllers: [
    MacrociclosController,
    MesociclosController,
    MicrociclosController,
    SesionesController,
  ],
  providers: [
    MacrociclosService,
    MesociclosService,
    MicrociclosService,
    SesionesService,
    SesionFactory,
    DateRangeValidator,
    PrismaService,
    CatalogoEjerciciosService,
  ],
  exports: [
    MacrociclosService,
    MesociclosService,
    MicrociclosService,
    SesionesService,
    SesionFactory,
  ],
})
export class PlanificacionModule {}
