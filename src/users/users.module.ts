import { Module } from '@nestjs/common';
import { UsersController } from '@src/users/controllers/users.controller';
import { ThrottlerProvider } from '@src/shared/providers/throttler/throttler.provider';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@src/users/entities/user.entity';
import { UserService } from '@src/users/services/user.service';
import { UserRepository } from '@src/users/repositories/users.repository';
import { CreateUserMapper } from '@src/users/mappers/create-user.mapper';
import { VerificationModule } from '@src/verification/verification.module';
import { UserModuleAlias } from '@src/users/constants/alias';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), VerificationModule],
  controllers: [UsersController],
  providers: [
    ThrottlerProvider,
    {
      provide: UserModuleAlias.USER_REPOSITORY_ALIAS,
      useClass: UserRepository,
    },
    CreateUserMapper,
    UserService,
  ],
  exports: [
    UserModuleAlias.USER_REPOSITORY_ALIAS,
    CreateUserMapper,
    UserService,
  ],
})
export class UserModule {}
