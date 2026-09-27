import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { RecipeBadge } from '@src/recipes/constants/recipe-badge.enum';
import { RecipeIngredientItemDto } from '@src/recipes/dtos/recipe-ingredient-item.dto';
import { RecipeInstructionItemDto } from '@src/recipes/dtos/recipe-instruction-item.dto';
import { RecipeChefTipItemDto } from '@src/recipes/dtos/recipe-chef-tip-item.dto';
import { RecipeVisualStepItemDto } from '@src/recipes/dtos/recipe-visual-step-item.dto';
import { NutritionalInfoDto } from '@src/recipes/dtos/nutritional-info.dto';

export class UpsertRecipeDto {
  @ApiPropertyOptional({
    description:
      'Informe o id de uma receita já existente para editá-la. Omita para criar uma nova receita.',
  })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty({ example: 'Estrogonofe Cremoso de Frango com Arroz Branco' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({
    example: 'Um clássico de almoço caseiro em versão equilibrada...',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  subtitle?: string;

  @ApiPropertyOptional({ example: 'FRANGO QUE NÃO ENJOA' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiProperty({ example: 35 })
  @IsInt()
  @Min(1)
  prepTimeMinutes: number;

  @ApiProperty({ example: 4 })
  @IsInt()
  @Min(1)
  servings: number;

  @ApiPropertyOptional({ example: '1 prato (aprox. 350g)' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  portionReference?: string;

  @ApiProperty({ enum: RecipeBadge, isArray: true })
  @IsArray()
  @IsEnum(RecipeBadge, { each: true })
  badges: RecipeBadge[];

  @ApiProperty({ type: [RecipeIngredientItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RecipeIngredientItemDto)
  ingredients: RecipeIngredientItemDto[];

  @ApiPropertyOptional({ type: NutritionalInfoDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => NutritionalInfoDto)
  nutritionalInfo?: NutritionalInfoDto;

  @ApiPropertyOptional({ type: [RecipeVisualStepItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipeVisualStepItemDto)
  visualSteps?: RecipeVisualStepItemDto[];

  @ApiProperty({ type: [RecipeInstructionItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RecipeInstructionItemDto)
  instructions: RecipeInstructionItemDto[];

  @ApiPropertyOptional({ type: [RecipeChefTipItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipeChefTipItemDto)
  chefTips?: RecipeChefTipItemDto[];
}
