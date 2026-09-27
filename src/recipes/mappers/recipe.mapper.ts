import { Injectable } from '@nestjs/common';
import { RecipeEntity } from '@src/recipes/entities/recipe.entity';

@Injectable()
export class RecipeMapper {
  map(recipe: RecipeEntity) {
    return {
      id: recipe.id,
      title: recipe.title,
      subtitle: recipe.subtitle ?? undefined,
      category: recipe.category ?? undefined,
      prepTimeMinutes: recipe.prepTimeMinutes,
      servings: recipe.servings,
      portionReference: recipe.portionReference ?? undefined,
      badges: recipe.badges,
      ingredients: (recipe.ingredients ?? [])
        .slice()
        .sort((a, b) => a.position - b.position)
        .map((ingredient) => ({
          id: ingredient.id,
          description: ingredient.description,
        })),
      nutritionalInfo:
        recipe.nutritionalInfo.caloriesKcal !== null
          ? {
              caloriesKcal: recipe.nutritionalInfo.caloriesKcal,
              proteinsGrams: recipe.nutritionalInfo.proteinsGrams as number,
              carbohydratesGrams: recipe.nutritionalInfo
                .carbohydratesGrams as number,
              fatsGrams: recipe.nutritionalInfo.fatsGrams as number,
              fibersGrams: recipe.nutritionalInfo.fibersGrams as number,
              sodiumMg: recipe.nutritionalInfo.sodiumMg as number,
            }
          : undefined,
      visualSteps: (recipe.visualSteps ?? [])
        .slice()
        .sort((a, b) => a.stepNumber - b.stepNumber)
        .map((visualStep) => ({
          id: visualStep.id,
          stepNumber: visualStep.stepNumber,
          description: visualStep.description,
        })),
      instructions: (recipe.instructions ?? [])
        .slice()
        .sort((a, b) => a.position - b.position)
        .map((instruction) => ({
          id: instruction.id,
          description: instruction.description,
        })),
      chefTips: (recipe.chefTips ?? [])
        .slice()
        .sort((a, b) => a.position - b.position)
        .map((chefTip) => ({
          id: chefTip.id,
          tip: chefTip.description,
        })),
      mainImageUrl: recipe.mainImagePath
        ? `/recipes/${recipe.id}/image`
        : undefined,
    };
  }
}
