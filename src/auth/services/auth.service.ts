import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IUserRepository } from '@src/users/interfaces/user.repository.interface';
import { LoginDto } from '@src/auth/dtos/login.dto';
import { CreateUserMapper } from '@src/users/mappers/create-user.mapper';
import { encryptPassword } from '@src/shared/helpers/password.helper';
import { VerificationService } from '@src/verification/services/verification.service';
import { EmailService } from '@src/email/services/email.service';
import { EmailTemplateEnum } from '@src/email/enums/email-templates.enum';
import { isEmail } from 'class-validator';
import { generateRandomCode } from '@src/verification/utils/generate-random-key.util';
import { UserModuleAlias } from '@src/users/constants/alias';

@Injectable()
export class AuthService {
  constructor(
    @Inject(UserModuleAlias.USER_REPOSITORY_ALIAS)
    private readonly userRepository: IUserRepository,
    private readonly userMapper: CreateUserMapper,
    private readonly jwtService: JwtService,
    private readonly verificationService: VerificationService,
    private readonly emailService: EmailService,
  ) {}

  async validateUser({ email, password }: LoginDto) {
    const user = await this.userRepository.findUserByEmail(email, true);
    if (!user) {
      return null;
    }

    if (!user.emailValidatedAt) {
      throw new UnauthorizedException('User email is not verified!');
    }

    try {
      const passwordHash = encryptPassword(password);
      const isMatch = passwordHash === user.password;
      if (!isMatch) {
        return null;
      }
    } catch (error) {
      return null;
    }

    return this.userMapper.map(user);
  }

  async login(user: any) {
    const payload = user ? { email: user.email, sub: user.sub.id } : {};
    return {
      access_token: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET as string,
      }),
    };
  }

  async generateEmailVerification(userId: string) {
    const user = await this.userRepository.findUserById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.emailValidatedAt) {
      throw new UnprocessableEntityException('Account already verified');
    }

    const otp = await this.verificationService.generateOtp(userId);
    await this.emailService.sendTemplate(EmailTemplateEnum.CONFIRMATION, {
      user: {
        userName: user.name,
        email: user.email,
      },
      otp,
    });
  }

  async generateEmailForgetPassword(email: string) {
    if (!isEmail(email)) {
      throw new BadRequestException('Invalid email');
    }

    const user = await this.userRepository.findUserByEmail(email, false);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const id = generateRandomCode(36);
    await this.verificationService.generateOtp(id);
    await this.emailService.sendTemplate(EmailTemplateEnum.FORGET_PASSWORD, {
      id,
      user,
    });
  }

  async verifyEmail(userId: string, otp: string) {
    const user = await this.userRepository.findUserById(userId);
    if (!user) {
      throw new UnprocessableEntityException('User not found!');
    }

    if (user.emailValidatedAt) {
      throw new UnprocessableEntityException('Account already verified');
    }

    const isValid = await this.verificationService.validateOtp(user.id, otp);

    if (!isValid) {
      throw new UnprocessableEntityException('Code is not valid');
    }

    user.emailValidatedAt = new Date();
    user.isActivated = true;

    await this.userRepository.save(user);

    return true;
  }
}
