import { Module, forwardRef } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../../database/prisma.service';
import { CatalogoEjerciciosService } from './services/catalogo-ejercicios.service';
import { AlertasSistemaService } from './services/alertas-sistema.service';
import { RankingAtletasService } from './services/ranking-atletas.service';
import { RankingController } from './controllers/ranking.controller';
import { NotificacionesController } from './controllers/notificaciones.controller';
import { NotificacionesService } from './services/notificaciones.service';
import { NotificacionesCronService } from './services/notificaciones-cron.service';

// Modulo de Algoritmo de Recomendaciones
// Incluye:
// - Catalogo de ejercicios y filtrado
// - Sistema de alertas automaticas (fatiga, lesion, peso, desviacion)
// - Ranking de atletas para competencias
// - Notificaciones del sistema
@Module({
  imports: [
    DatabaseModule,
    AuthModule,
  ],
  controllers: [
    RankingController,
    NotificacionesController,
  ],
  providers: [
    PrismaService,
    CatalogoEjerciciosService,
    AlertasSistemaService,
    RankingAtletasService,
    NotificacionesService,
    NotificacionesCronService,
  ],
  exports: [
    CatalogoEjerciciosService,
    AlertasSistemaService,
    RankingAtletasService,
    NotificacionesService,
  ],
})
export class AlgoritmoModule {}
