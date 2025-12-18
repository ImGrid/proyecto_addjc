import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClsModule } from 'nestjs-cls';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { PrismaService } from './database/prisma.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AtletasModule } from './modules/atletas/atletas.module';
import { EntrenadoresModule } from './modules/entrenadores/entrenadores.module';
import { PlanificacionModule } from './modules/planificacion/planificacion.module';
import { RegistroPostEntrenamientoModule } from './modules/registro-post-entrenamiento/registro-post-entrenamiento.module';
import { DolenciasModule } from './modules/dolencias/dolencias.module';
import { TestingModule } from './modules/testing/testing.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
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
    DatabaseModule,
    AuthModule,
    UsersModule,
    AtletasModule,
    EntrenadoresModule,
    PlanificacionModule,
    RegistroPostEntrenamientoModule,
    DolenciasModule,
    TestingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
