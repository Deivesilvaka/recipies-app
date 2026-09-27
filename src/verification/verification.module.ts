import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificationEntity } from '@src/verification/entities/verification.entity';
import { VerificationService } from '@src/verification/services/verification.service';
import { VerificationRepository } from '@src/verification/repository/verification.repository';
import { VerificationModuleAlias } from '@src/verification/constants/alias';

@Module({
  imports: [TypeOrmModule.forFeature([VerificationEntity])],
  exports: [
    VerificationService,
    VerificationModuleAlias.VERIFICATION_REPOSITORY_ALIAS,
  ],
  providers: [
    VerificationService,
    {
      provide: VerificationModuleAlias.VERIFICATION_REPOSITORY_ALIAS,
      useClass: VerificationRepository,
    },
  ],
})
export class VerificationModule {}
