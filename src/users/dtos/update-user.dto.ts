import { ApiProperty } from '@nestjs/swagger';
import { IsBrazilianPhoneNumber } from '@shared/decorators/is-brazilian-phone-number.decorator';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @IsBrazilianPhoneNumber()
  phoneNumber: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  name: string;
}
