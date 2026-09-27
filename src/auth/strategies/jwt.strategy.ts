import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IUserRepository } from '@src/users/interfaces/user.repository.interface';
import { ConfigModule } from '@nestjs/config';
import { UserModuleAlias } from '@src/users/constants/alias';
ConfigModule.forRoot();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(UserModuleAlias.USER_REPOSITORY_ALIAS)
    private readonly userRepository: IUserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET as string,
    });
  }

  async validate(payload: any) {
    const user = await this.userRepository.findUserByEmail(
      payload.email,
      false,
    );

    if (!user) {
      throw new UnauthorizedException('User Not found!');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      emailValidatedAt: user.emailValidatedAt,
      isActivated: user.isActivated,
    };
  }
}
