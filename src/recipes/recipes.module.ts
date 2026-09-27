import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecipeEntity } from '@src/recipes/entities/recipe.entity';
import { RecipeIngredientEntity } from '@src/recipes/entities/recipe-ingredient.entity';
import { RecipeInstructionEntity } from '@src/recipes/entities/recipe-instruction.entity';
import { RecipeVisualStepEntity } from '@src/recipes/entities/recipe-visual-step.entity';
import { RecipeChefTipEntity } from '@src/recipes/entities/recipe-chef-tip.entity';
import { RecipesController } from '@src/recipes/controllers/recipes.controller';
import { RecipesService } from '@src/recipes/services/recipes.service';
import { RecipeMapper } from '@src/recipes/mappers/recipe.mapper';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RecipeEntity,
      RecipeIngredientEntity,
      RecipeInstructionEntity,
      RecipeVisualStepEntity,
      RecipeChefTipEntity,
    ]),
  ],
  controllers: [RecipesController],
  providers: [RecipesService, RecipeMapper],
})
export class RecipesModule {}
