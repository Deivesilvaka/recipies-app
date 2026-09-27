import {
  Body,
  Controller,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '@src/auth/services/auth.service';
import { Public } from '@src/auth/decorators/public.decorator';
import { LocalAuthGuard } from '@src/auth/guards/local-auth.guard';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { STATUS_CODES } from 'http';
import { LoginDto } from '@src/auth/dtos/login.dto';
import { NoAccountGuard } from '@src/auth/decorators/no-account-guard.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Login' })
  @ApiOkResponse({ description: STATUS_CODES[HttpStatus.OK] })
  @ApiUnauthorizedResponse({
    description: STATUS_CODES[HttpStatus.UNAUTHORIZED],
  })
  @Post('login')
  async login(@Request() req: Express.Request, @Body() user: LoginDto) {
    return this.authService.login({
      ...user,
      sub: req?.user,
    });
  }

  @NoAccountGuard()
  @Public()
  @Post('verify/:otp/userId/:userId')
  @ApiOperation({ summary: 'Verify otp sended to email' })
  async verifyEmail(
    @Param('otp') otp: string,
    @Param('userId', new ParseUUIDPipe()) userId: string,
  ) {
    const result = await this.authService.verifyEmail(userId, otp);

    return { status: result ? 'sucess' : 'failure' };
  }

  @NoAccountGuard()
  @Public()
  @Post('verification-otp/:userId')
  @ApiOperation({ summary: 'Send authentication token to email' })
  async generateEmailVerification(
    @Param('userId', new ParseUUIDPipe()) userId: string,
  ) {
    await this.authService.generateEmailVerification(userId);

    return { status: 'success', message: 'Sending email in a moment' };
  }

  @NoAccountGuard()
  @Public()
  @Post('forget-password')
  @ApiOperation({
    summary: 'First step to reset password case user forget it.',
  })
  async generateEmailForgetPassword(@Query('userEmail') userEmail: string) {
    await this.authService.generateEmailForgetPassword(userEmail);

    return { status: 'success', message: 'Sending email in a moment' };
  }
}
