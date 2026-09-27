import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { name } from '../package.json';
import { Public } from '@src/auth/decorators/public.decorator';
import { join } from 'path';
import { AppService } from '@src/app.service';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get('/health')
  @Public()
  @ApiOperation({ summary: 'Heathcheck.' })
  healthCheck(): string {
    return `Service ${name} is up and running`;
  }

  @Get('')
  @Public()
  @ApiOperation({
    summary: 'Second step to reset password case user forget it.',
  })
  async getPasswordResetPage(@Query('id') id: string, @Res() res: Response) {
    await this.appService.deactivateToken(id);
    const filePath = join(__dirname, '..', 'public', 'index.html');
    res.setHeader('Content-Type', 'text/html');
    res.sendFile(filePath);
  }
}
