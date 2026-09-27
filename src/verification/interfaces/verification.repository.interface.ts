import { VerificationEntity } from '@src/verification/entities/verification.entity';

export interface IVerificationRepository {
  findOneTokenByUserId(
    userId: string,
    now: Date,
  ): Promise<VerificationEntity | null>;

  findOneTokenByUserIdToValidate(
    userId: string,
    now: Date,
  ): Promise<VerificationEntity | null>;

  delete(userId: string): Promise<void>;

  findOneByUserId(id: string): Promise<VerificationEntity | null>;

  save(userId: string, now: Date, hashedToken: string): Promise<void>;
}
