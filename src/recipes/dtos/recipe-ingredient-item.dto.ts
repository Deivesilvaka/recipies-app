import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class RecipeIngredientItemDto {
  @ApiPropertyOptional({
    description:
      'Informe o id de um ingrediente já salvo para atualizá-lo. Omita para criar um novo.',
  })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty({ example: '500 g de peito de frango em cubos' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  description: string;
}
