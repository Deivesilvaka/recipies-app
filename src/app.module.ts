import { Module } from '@nestjs/common';
import { AppController } from '@src/app.controller';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from '@src/config/dataSource';
import { ThrottlerProvider } from '@src/shared/providers/throttler/throttler.provider';
import { UserModule } from '@src/users/users.module';
import { AuthModule } from '@src/auth/auth.module';
import { JWTProvider } from '@src/shared/providers/jwt/jwt.provider';
import { AccountGuardProvider } from '@shared/providers/account-guard/account-guard.provider';
import { AppService } from '@src/app.service';
import { VerificationModule } from '@src/verification/verification.module';
import { RecipesModule } from '@src/recipes/recipes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        dataSourceOptions(configService),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 30,
      },
    ]),
    UserModule,
    AuthModule,
    VerificationModule,
    RecipesModule,
  ],
  controllers: [AppController],
  providers: [ThrottlerProvider, JWTProvider, AccountGuardProvider, AppService],
})
export class AppModule {}
