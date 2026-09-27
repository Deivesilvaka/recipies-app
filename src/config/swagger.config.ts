import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import packageJson from '../../package.json';

export const setupSwagger = (app: INestApplication) => {
  const options = new DocumentBuilder()
    .setTitle('App Documentation')
    .setDescription('API description')
    .setVersion(packageJson.version)
    .addBearerAuth()
    .build();

  SwaggerModule.setup(`/api`, app, SwaggerModule.createDocument(app, options));
};
