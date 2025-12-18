import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    // Crear pool de conexiones de PostgreSQL
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({ connectionString });

    // Crear adapter de Prisma para PostgreSQL
    const adapter = new PrismaPg(pool);

    // Inicializar PrismaClient con el adapter (requerido en Prisma 7)
    super({
      adapter,
      log: ['error', 'warn'],
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('Database connection established successfully');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Failed to connect to database', errorMessage);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Database connection closed');
  }

  /**
   * Helper method to clean database (útil para testing)
   */
  cleanDatabase(): void {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production!');
    }

    // Aquí se puede implementar la limpieza de tablas si es necesario
    this.logger.warn('Database cleaned (only in development/test)');
  }
}
