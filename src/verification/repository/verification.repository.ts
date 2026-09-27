import { Injectable } from '@nestjs/common';
import { MoreThan, Repository } from 'typeorm';
import { VerificationEntity } from '@src/verification/entities/verification.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class VerificationRepository {
  private readonly minRequestIntervalMinutes = 1;
  private readonly tokenExpirationMinutes = 3;

  constructor(
    @InjectRepository(VerificationEntity)
    private readonly verificationRepository: Repository<VerificationEntity>,
  ) {}

  async findOneTokenByUserId(
    userId: string,
    now: Date,
  ): Promise<VerificationEntity | null> {
    return this.verificationRepository.findOne({
      where: {
        userId,
        createdAt: MoreThan(
          new Date(now.getTime() - this.minRequestIntervalMinutes * 60 * 1000),
        ),
      },
    });
  }

  async findOneTokenByUserIdToValidate(
    userId: string,
    now: Date,
  ): Promise<VerificationEntity | null> {
    return this.verificationRepository.findOne({
      where: {
        userId,
        expiresAt: MoreThan(now),
      },
    });
  }

  async delete(userId: string) {
    const allRegistries = await this.verificationRepository.find({
      where: { userId },
    });

    await Promise.all(
      allRegistries.map((verification) =>
        this.verificationRepository.delete(verification.id),
      ),
    );
  }

  async save(userId: string, now: Date, token: string) {
    await this.verificationRepository.save({
      userId,
      token,
      expiresAt: new Date(
        now.getTime() + this.tokenExpirationMinutes * 60 * 1000,
      ),
    });
  }

  async findOneByUserId(userId: string): Promise<VerificationEntity | null> {
    return this.verificationRepository.findOne({
      where: {
        userId,
      },
    });
  }
}
