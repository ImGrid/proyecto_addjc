import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ClsModule } from 'nestjs-cls';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { DatabaseModule } from './database/database.module';
import { PrismaService } from './database/prisma.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AtletasModule } from './modules/atletas/atletas.module';
import { EntrenadoresModule } from './modules/entrenadores/entrenadores.module';
import { PlanificacionModule } from './modules/planificacion/planificacion.module';
import { RegistroPostEntrenamientoModule } from './modules/registro-post-entrenamiento/registro-post-entrenamiento.module';
import { DolenciasModule } from './modules/dolencias/dolencias.module';
import { AsignacionesModule } from './modules/asignaciones/asignaciones.module';
import { TestingModule } from './modules/testing/testing.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { AlgoritmoModule } from './modules/algoritmo/algoritmo.module';
import { RecomendacionesModule } from './modules/recomendaciones/recomendaciones.module';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';
import {
  databaseConfig,
  jwtConfig,
  appConfig,
  validationSchema,
} from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: '.env',
      load: [databaseConfig, jwtConfig, appConfig],
      validationSchema: validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    // Modulo para tareas programadas (cron jobs)
    ScheduleModule.forRoot(),
    // Configuracion de transacciones declarativas con CLS
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
      },
      plugins: [
        new ClsPluginTransactional({
          imports: [DatabaseModule],
          adapter: new TransactionalAdapterPrisma({
            prismaInjectionToken: PrismaService,
          }),
        }),
      ],
    }),
    CommonModule,
    DatabaseModule,
    AuthModule,
    UsersModule,
    AtletasModule,
    EntrenadoresModule,
    PlanificacionModule,
    RegistroPostEntrenamientoModule,
    DolenciasModule,
    AsignacionesModule,
    TestingModule,
    AuditLogsModule,
    AlgoritmoModule,
    RecomendacionesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Interceptor global para registrar activity logs
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
})
export class AppModule {}
