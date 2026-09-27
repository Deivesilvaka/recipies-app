import { Body, Controller, Get, HttpStatus, Patch, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { STATUS_CODES } from 'http';
import { CreateUserDto } from '@src/users/dtos/create-user.dto';
import { UserService } from '@src/users/services/user.service';
import { Public } from '@src/auth/decorators/public.decorator';
import { CurrentUser } from '@src/auth/decorators/current-user.decorator';
import { UpdateUserPasswordDto } from '@src/users/dtos/update-password.dto';
import { UpdateUserDto } from '@src/users/dtos/update-user.dto';
import { UpdateUserPasswordWithEmailDto } from '@src/users/dtos/update-password-with-email.dto';

@ApiTags('Users')
@Controller('user')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Post('')
  @Public()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiCreatedResponse({ description: STATUS_CODES[HttpStatus.CREATED] })
  @ApiConflictResponse({ description: STATUS_CODES[HttpStatus.CONFLICT] })
  @ApiBody({
    type: CreateUserDto,
  })
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Patch('/')
  @ApiOperation({ summary: 'Update user data' })
  @ApiCreatedResponse({ description: STATUS_CODES[HttpStatus.OK] })
  @ApiNotFoundResponse({ description: STATUS_CODES[HttpStatus.NOT_FOUND] })
  @ApiBearerAuth()
  async updateUserData(
    @CurrentUser() user: { userId: string },
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(user.userId, updateUserDto);
  }

  @Get('/profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find current session user!' })
  @ApiOkResponse({ description: STATUS_CODES[HttpStatus.OK] })
  @ApiNotFoundResponse({ description: STATUS_CODES[HttpStatus.NOT_FOUND] })
  async findCurrentUser(@CurrentUser() user: { userId: string }) {
    return this.userService.userProfile(user.userId);
  }

  @Patch('/password')
  @ApiOperation({ summary: 'Update user password' })
  @ApiCreatedResponse({ description: STATUS_CODES[HttpStatus.OK] })
  @ApiNotFoundResponse({ description: STATUS_CODES[HttpStatus.NOT_FOUND] })
  @ApiBearerAuth()
  async updateUserPassword(
    @CurrentUser() user: { email: string },
    @Body() updateUserPasswordDto: UpdateUserPasswordDto,
  ) {
    return this.userService.updateUserPassword({
      ...updateUserPasswordDto,
      email: user.email,
    });
  }

  @Post('/forget-password')
  @Public()
  @ApiOperation({ summary: 'Update user password' })
  @ApiCreatedResponse({ description: STATUS_CODES[HttpStatus.OK] })
  @ApiNotFoundResponse({ description: STATUS_CODES[HttpStatus.NOT_FOUND] })
  async updateUserPasswordAfterForget(
    @Body() updateUserPasswordDto: UpdateUserPasswordWithEmailDto,
  ) {
    return this.userService.updateUserPassword(updateUserPasswordDto);
  }
}
