import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '@src/auth/decorators/public.decorator';
import { UserEntity } from '@src/users/entities/user.entity';
import { NO_ACCOUNT_GUARD_KEY } from '@src/auth/decorators/no-account-guard.decorator';

@Injectable()
export class AccountGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const noAccountGuard = this.reflector.getAllAndOverride<boolean>(
      NO_ACCOUNT_GUARD_KEY,
      [context.getHandler(), context.getClass()],
    );

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic || noAccountGuard) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: UserEntity = request.user;

    if (!user.isActivated || !user.emailValidatedAt) {
      throw new UnauthorizedException(`Account is not activated`);
    }

    return user.isActivated && !!user.emailValidatedAt;
  }
}
