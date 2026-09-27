import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class RecipeInstructionItemDto {
  @ApiPropertyOptional({
    description:
      'Informe o id de uma instrução já salva para atualizá-la. Omita para criar uma nova.',
  })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty({ example: 'Tempere o frango com sal e pimenta.' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(2000)
  description: string;
}
