import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class RecipeChefTipItemDto {
  @ApiPropertyOptional({
    description:
      'Informe o id de uma dica já salva para atualizá-la. Omita para criar uma nova.',
  })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty({ example: 'Pode ser congelado por até 3 meses.' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(2000)
  tip: string;
}
