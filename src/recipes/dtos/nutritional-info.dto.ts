import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class NutritionalInfoDto {
  @ApiProperty({ example: 428 })
  @IsInt()
  @Min(0)
  caloriesKcal: number;

  @ApiProperty({ example: 32 })
  @IsInt()
  @Min(0)
  proteinsGrams: number;

  @ApiProperty({ example: 34 })
  @IsInt()
  @Min(0)
  carbohydratesGrams: number;

  @ApiProperty({ example: 17 })
  @IsInt()
  @Min(0)
  fatsGrams: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(0)
  fibersGrams: number;

  @ApiProperty({ example: 498 })
  @IsInt()
  @Min(0)
  sodiumMg: number;
}
