import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configurar carpeta de archivos estáticos
  app.useStaticAssets(join(__dirname, '..', 'public'));

  const port = process.env.PORT || 3001;
  app.enableCors({
    origin: ['http://localhost:5173', 'https://tu-frontend-url.com', 'http://localhost:3001'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  await app.listen(port);

  console.log(`Servidor escuchando en el puerto ${port}`);
}
bootstrap();
