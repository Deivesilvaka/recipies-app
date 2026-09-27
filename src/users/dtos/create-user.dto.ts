import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBooleanString, IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { IsAdult } from '@shared/decorators/is-adult.decorator';
import { encryptPassword } from '@src/shared/helpers/password.helper';
import { Match } from '@shared/decorators/match.decorator';
import { IsBrazilianPhoneNumber } from '@shared/decorators/is-brazilian-phone-number.decorator';

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => encryptPassword(value))
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => encryptPassword(value))
  @Match('password', { message: 'Password and confirmation do not match' })
  confirmPassword: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsAdult()
  birthdate: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsBrazilianPhoneNumber()
  phoneNumber: string;

  @ApiProperty()
  @IsBooleanString()
  @IsNotEmpty()
  isTermsAccepted: string;
}
