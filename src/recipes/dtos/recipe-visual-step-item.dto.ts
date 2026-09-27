import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class RecipeVisualStepItemDto {
  @ApiPropertyOptional({
    description:
      'Informe o id de um passo já salvo para atualizá-lo. Omita para criar um novo.',
  })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  stepNumber: number;

  @ApiProperty({ example: 'Tempere o frango com sal e pimenta.' })
  @IsNotEmpty()
  @IsString()
  description: string;
}
