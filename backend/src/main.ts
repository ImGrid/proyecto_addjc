import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { PrismaClientExceptionFilter } from './common/filters/prisma-client-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar ValidationPipe global para validar DTOs automaticamente
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Eliminar propiedades que no estan en el DTO
      forbidNonWhitelisted: true, // Lanzar error si hay propiedades no permitidas
      transform: true, // Transformar payloads a instancias de DTO
    }),
  );

  // Configurar filtro global de excepciones de Prisma
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

  // Habilitar CORS para permitir peticiones desde el frontend
  // IMPORTANTE: credentials: true es necesario para HttpOnly cookies
  app.enableCors({
    origin: 'http://localhost:5000', // URL del frontend Next.js
    credentials: true,                // Permite enviar y recibir cookies
  });

  // Agregar prefijo global 'api' a todas las rutas
  // Ejemplo: /auth/login se convierte en /api/auth/login
  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
