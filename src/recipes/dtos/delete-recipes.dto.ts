import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class DeleteRecipesDto {
  @ApiProperty({
    type: [String],
    description: 'Ids das receitas a excluir (apenas as que pertencem ao usuário logado são excluídas).',
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  ids: string[];
}
