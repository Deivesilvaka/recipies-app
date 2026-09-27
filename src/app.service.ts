import { Injectable } from '@nestjs/common';
import { VerificationService } from '@src/verification/services/verification.service';

@Injectable()
export class AppService {
  constructor(private readonly verificationService: VerificationService) {}

  async deactivateToken(id: string) {
    await this.verificationService.validateIfTokenExists(id);
  }
}
