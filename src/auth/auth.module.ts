import { Module } from '@nestjs/common';
import { AuthController } from '@src/auth/controllers/auth.controller';
import { UserModule } from '@src/users/users.module';
import { LocalStrategy } from '@src/auth/strategies/local.strategy';
import { AuthService } from '@src/auth/services/auth.service';
import { JwtStrategy } from '@src/auth/strategies/jwt.strategy';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { VerificationModule } from '@src/verification/verification.module';
import { EmailModule } from '@src/email/email.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '2m' },
      }),
    }),
    UserModule,
    VerificationModule,
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [LocalStrategy, JwtStrategy, AuthService, JwtService],
})
export class AuthModule {}
