import { ConfigModule } from '@nestjs/config';

ConfigModule.forRoot();
export const APP_NAME = process.env.APP_NAME;
