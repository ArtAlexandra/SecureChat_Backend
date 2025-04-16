import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(join(__dirname, '..', 'uploads'));

  app.enableCors({
    origin: 'http://localhost:3000', // Разрешаем запросы только с этого адреса
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Разрешенные HTTP-методы
    allowedHeaders: 'Content-Type,Authorization', // Разрешенные заголовки
    credentials: true, // Разрешаем передачу кук и авторизационных заголовков
    maxAge: 3600, // Кеширование CORS-префлайт запросов (в секундах)
  });
  await app.listen(3001);
}
bootstrap();
