import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';

export const JWTProvider = {
  provide: APP_GUARD,
  useClass: JwtAuthGuard,
};
