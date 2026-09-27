import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { setupSwagger } from '@src/config/swagger.config';
import { ConfigModule } from '@nestjs/config';
import bodyParser from 'body-parser';
ConfigModule.forRoot();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    helmet({
      // A API é consumida por um front-end hospedado em outra origem (site estático)
      // e o endpoint de imagem é público por design — CORP "same-origin" bloquearia o <img> cross-origin.
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(bodyParser.json());
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      enableDebugMessages: process.env.NODE_ENV !== 'prd',
      validateCustomDecorators: true,
    }),
  );

  if (process.env.NODE_ENV !== 'prd') {
    setupSwagger(app);
  }

  await app.listen(process.env.APP_PORT || 3000, () => {
    console.log('App is running');
  });
}
bootstrap();
