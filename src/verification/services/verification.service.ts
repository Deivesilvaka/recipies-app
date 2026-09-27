import {
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { IVerificationRepository } from '@src/verification/interfaces/verification.repository.interface';
import { generateOtp } from '@src/verification/utils/generate-otp.util';
import * as bcrypt from 'bcryptjs';
import { VerificationModuleAlias } from '@src/verification/constants/alias';

@Injectable()
export class VerificationService {
  private readonly saltRounds = 10;

  constructor(
    @Inject(VerificationModuleAlias.VERIFICATION_REPOSITORY_ALIAS)
    private readonly verificationRepository: IVerificationRepository,
  ) {}

  async generateOtp(userId: string): Promise<string> {
    const now = new Date();

    const recentToken = await this.verificationRepository.findOneTokenByUserId(
      userId,
      now,
    );

    if (recentToken) {
      throw new UnprocessableEntityException(
        'Please wait a minute before requesting a new token.',
      );
    }

    const otp = generateOtp();
    const hashedToken = await bcrypt.hash(otp, this.saltRounds);

    await this.verificationRepository.delete(userId);

    await this.verificationRepository.save(userId, now, hashedToken);

    return otp;
  }

  async validateOtp(userId: string, token: string): Promise<boolean> {
    const validToken =
      await this.verificationRepository.findOneTokenByUserIdToValidate(
        userId,
        new Date(),
      );

    await this.verificationRepository.delete(userId);

    if (validToken && (await bcrypt.compare(token, validToken.token))) {
      return true;
    }

    return false;
  }

  async validateIfTokenExists(id: string) {
    const token = await this.verificationRepository.findOneByUserId(id);

    if (!token) {
      throw new NotFoundException('Token not found!');
    }

    await this.verificationRepository.delete(token.userId);
  }
}
