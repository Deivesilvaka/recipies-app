import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { encryptPassword } from '@src/shared/helpers/password.helper';

export class UpdateUserPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => encryptPassword(value))
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => encryptPassword(value))
  confirmPassword: string;
}
