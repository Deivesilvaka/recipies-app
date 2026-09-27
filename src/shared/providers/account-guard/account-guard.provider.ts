import { APP_GUARD } from '@nestjs/core';
import { AccountGuard } from '@src/auth/guards/account.guard';

export const AccountGuardProvider = {
  provide: APP_GUARD,
  useClass: AccountGuard,
};
