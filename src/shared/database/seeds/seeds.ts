import { encryptPassword } from '@src/shared/helpers/password.helper';
import dataSource from '@src/config/dataSource';
import { UserEntity } from '@src/users/entities/user.entity';
import { RecipeEntity } from '@src/recipes/entities/recipe.entity';
import { RecipeBadge } from '@src/recipes/constants/recipe-badge.enum';
import recipesSeedData from '@src/shared/database/seeds/data/recipes.seed-data.json';

const SEED_OWNER_EMAIL = 'seed@recipes.app';
const SEED_OWNER_PASSWORD = 'Seed@123';

async function getOrCreateSeedOwner(): Promise<UserEntity> {
  const userRepository = dataSource.getRepository(UserEntity);

  const existing = await userRepository.findOne({
    where: { email: SEED_OWNER_EMAIL },
  });

  if (existing) {
    return existing;
  }

  return userRepository.save(
    userRepository.create({
      name: 'Seed',
      birthdate: '01/01/1990',
      email: SEED_OWNER_EMAIL,
      password: encryptPassword(SEED_OWNER_PASSWORD),
      phoneNumber: '11999999999',
      isTermsAccepted: true,
      isActivated: true,
      emailValidatedAt: new Date(),
    }),
  );
}

async function seedRecipes(ownerId: string): Promise<void> {
  const recipeRepository = dataSource.getRepository(RecipeEntity);

  for (const recipe of recipesSeedData) {
    await recipeRepository.save(
      recipeRepository.create({
        ownerId,
        title: recipe.title,
        subtitle: recipe.subtitle ?? null,
        category: recipe.category ?? null,
        prepTimeMinutes: recipe.prepTimeMinutes,
        servings: recipe.servings,
        portionReference: recipe.portionReference ?? null,
        badges: recipe.badges as RecipeBadge[],
        nutritionalInfo: recipe.nutritionalInfo,
        ingredients: recipe.ingredients.map((description, position) => ({
          description,
          position,
        })),
        instructions: recipe.instructions.map((description, position) => ({
          description,
          position,
        })),
        visualSteps: (recipe.visualSteps ?? []).map((step) => ({
          stepNumber: step.stepNumber,
          description: step.description,
        })),
        chefTips: (recipe.chefTips ?? []).map((tip, position) => ({
          description: tip,
          position,
        })),
      }),
    );
  }
}

async function main(): Promise<void> {
  await dataSource.initialize();

  const owner = await getOrCreateSeedOwner();
  await seedRecipes(owner.id);

  console.log(
    `Seed concluído: ${recipesSeedData.length} receitas criadas para o usuário ${SEED_OWNER_EMAIL} (senha: ${SEED_OWNER_PASSWORD}).`,
  );

  await dataSource.destroy();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
