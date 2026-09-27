import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  EntityManager,
  EntityTarget,
  FindOptionsWhere,
  In,
  Repository,
} from 'typeorm';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { RecipeEntity } from '@src/recipes/entities/recipe.entity';
import { RecipeIngredientEntity } from '@src/recipes/entities/recipe-ingredient.entity';
import { RecipeInstructionEntity } from '@src/recipes/entities/recipe-instruction.entity';
import { RecipeVisualStepEntity } from '@src/recipes/entities/recipe-visual-step.entity';
import { RecipeChefTipEntity } from '@src/recipes/entities/recipe-chef-tip.entity';
import { UpsertRecipeDto } from '@src/recipes/dtos/upsert-recipe.dto';
import { SearchRecipesDto } from '@src/recipes/dtos/search-recipes.dto';
import { RecipeMapper } from '@src/recipes/mappers/recipe.mapper';
import {
  RECIPE_IMAGE_ALLOWED_MIME_TYPES,
  RECIPE_IMAGE_UPLOAD_DIR,
} from '@src/recipes/constants/recipe-image.constants';

const RECIPE_RELATIONS = [
  'ingredients',
  'instructions',
  'visualSteps',
  'chefTips',
];

interface ChildItemWithId {
  id?: string;
}

interface PersistedChildEntity {
  id: string;
  recipeId: string;
}

@Injectable()
export class RecipesService {
  constructor(
    @InjectRepository(RecipeEntity)
    private readonly recipeRepository: Repository<RecipeEntity>,
    private readonly dataSource: DataSource,
    private readonly recipeMapper: RecipeMapper,
  ) {}

  async upsert(ownerId: string, dto: UpsertRecipeDto) {
    const savedRecipe = await this.dataSource.transaction(async (manager) => {
      const recipeRepository = manager.getRepository(RecipeEntity);
      let recipe: RecipeEntity;

      if (dto.id) {
        const existing = await recipeRepository.findOne({
          where: { id: dto.id },
        });

        // 404 (não 403) para não confirmar a existência da receita a quem não é dono dela (evita IDOR por enumeração).
        if (!existing || existing.ownerId !== ownerId) {
          throw new NotFoundException('Receita não encontrada');
        }

        recipe = existing;
      } else {
        recipe = recipeRepository.create({ ownerId });
      }

      recipe.title = dto.title;
      recipe.subtitle = dto.subtitle ?? null;
      recipe.category = dto.category ?? null;
      recipe.prepTimeMinutes = dto.prepTimeMinutes;
      recipe.servings = dto.servings;
      recipe.portionReference = dto.portionReference ?? null;
      recipe.badges = dto.badges;
      recipe.nutritionalInfo = dto.nutritionalInfo ?? {
        caloriesKcal: null,
        proteinsGrams: null,
        carbohydratesGrams: null,
        fatsGrams: null,
        fibersGrams: null,
        sodiumMg: null,
      };

      recipe = await recipeRepository.save(recipe);

      recipe.ingredients = await this.syncChildren(
        manager,
        RecipeIngredientEntity,
        recipe.id,
        dto.ingredients,
        (item, position) => ({ description: item.description, position }),
      );

      recipe.instructions = await this.syncChildren(
        manager,
        RecipeInstructionEntity,
        recipe.id,
        dto.instructions,
        (item, position) => ({ description: item.description, position }),
      );

      recipe.visualSteps = await this.syncChildren(
        manager,
        RecipeVisualStepEntity,
        recipe.id,
        dto.visualSteps ?? [],
        (item) => ({
          stepNumber: item.stepNumber,
          description: item.description,
        }),
      );

      recipe.chefTips = await this.syncChildren(
        manager,
        RecipeChefTipEntity,
        recipe.id,
        dto.chefTips ?? [],
        (item, position) => ({ description: item.tip, position }),
      );

      return recipe;
    });

    return this.recipeMapper.map(savedRecipe);
  }

  async search(searchDto: SearchRecipesDto) {
    const page = searchDto.page ?? 1;
    const limit = searchDto.limit ?? 20;

    const buildBaseQuery = () => {
      const qb = this.recipeRepository.createQueryBuilder('recipe');

      if (searchDto.q) {
        qb.andWhere('recipe.title ILIKE :q', { q: `%${searchDto.q}%` });
      }

      if (searchDto.category) {
        qb.andWhere('recipe.category = :category', {
          category: searchDto.category,
        });
      }

      return qb;
    };

    const total = await buildBaseQuery().getCount();

    const idRows = await buildBaseQuery()
      .select('recipe.id', 'id')
      .orderBy('recipe.createdAt', 'DESC')
      .offset((page - 1) * limit)
      .limit(limit)
      .getRawMany<{ id: string }>();

    const ids = idRows.map((row) => row.id);

    if (!ids.length) {
      return { items: [], total, page, limit };
    }

    const recipes = await this.recipeRepository.find({
      where: { id: In(ids) },
      relations: RECIPE_RELATIONS,
    });

    const recipeById = new Map(recipes.map((recipe) => [recipe.id, recipe]));
    const orderedRecipes = ids
      .map((id) => recipeById.get(id))
      .filter((recipe): recipe is RecipeEntity => Boolean(recipe));

    return {
      items: orderedRecipes.map((recipe) => this.recipeMapper.map(recipe)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string) {
    const recipe = await this.recipeRepository.findOne({
      where: { id },
      relations: RECIPE_RELATIONS,
    });

    if (!recipe) {
      throw new NotFoundException('Receita não encontrada');
    }

    return this.recipeMapper.map(recipe);
  }

  async attachImage(
    ownerId: string,
    recipeId: string,
    file: Express.Multer.File,
  ) {
    const recipe = await this.recipeRepository.findOne({
      where: { id: recipeId },
    });

    // 404 (não 403) pelo mesmo motivo do upsert: não confirmar a existência da receita a quem não é dono.
    if (!recipe || recipe.ownerId !== ownerId) {
      throw new NotFoundException('Receita não encontrada');
    }

    const extension = RECIPE_IMAGE_ALLOWED_MIME_TYPES[file.mimetype];

    if (!extension) {
      throw new UnsupportedMediaTypeException(
        'Formato de imagem não suportado. Envie um arquivo JPEG, PNG ou WEBP.',
      );
    }

    await this.removeStoredImage(recipe);

    await mkdir(RECIPE_IMAGE_UPLOAD_DIR, { recursive: true });
    const filename = `${recipe.id}${extension}`;
    await writeFile(join(RECIPE_IMAGE_UPLOAD_DIR, filename), file.buffer);

    recipe.mainImagePath = filename;
    await this.recipeRepository.save(recipe);

    const updatedRecipe = await this.recipeRepository.findOne({
      where: { id: recipe.id },
      relations: RECIPE_RELATIONS,
    });

    return this.recipeMapper.map(updatedRecipe as RecipeEntity);
  }

  async getImageFile(
    recipeId: string,
  ): Promise<{ path: string; mimeType: string }> {
    const recipe = await this.recipeRepository.findOne({
      where: { id: recipeId },
    });

    if (!recipe || !recipe.mainImagePath) {
      throw new NotFoundException('Imagem não encontrada');
    }

    const mimeType =
      Object.entries(RECIPE_IMAGE_ALLOWED_MIME_TYPES).find(
        ([, ext]) => recipe.mainImagePath?.endsWith(ext),
      )?.[0] ?? 'application/octet-stream';

    return {
      path: join(RECIPE_IMAGE_UPLOAD_DIR, recipe.mainImagePath),
      mimeType,
    };
  }

  async remove(ownerId: string, ids: string[]): Promise<{ deletedIds: string[] }> {
    const recipes = await this.recipeRepository.find({
      where: { id: In(ids), ownerId },
    });

    // 404 quando nenhuma das receitas pedidas pertence ao usuário, pelo mesmo motivo do
    // upsert: não confirmar a existência/dono da receita a quem não tem acesso a ela.
    if (!recipes.length) {
      throw new NotFoundException('Receita não encontrada');
    }

    const deletedIds = recipes.map((recipe) => recipe.id);

    for (const recipe of recipes) {
      await this.removeStoredImage(recipe);
    }

    // recipeRepository.remove() zera o id das entidades removidas (TypeORM as marca como
    // "não persistidas"), por isso os ids são capturados antes de chamar remove().
    await this.recipeRepository.remove(recipes);

    return { deletedIds };
  }

  private async removeStoredImage(recipe: RecipeEntity): Promise<void> {
    if (!recipe.mainImagePath) {
      return;
    }

    try {
      await unlink(join(RECIPE_IMAGE_UPLOAD_DIR, recipe.mainImagePath));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  /**
   * Sincroniza uma coleção filha (ingredientes, instruções, passos ou dicas) com a receita:
   * itens com `id` são atualizados (validando que pertencem a esta receita, nunca a outra),
   * itens sem `id` são criados, e itens salvos que não vierem na lista são removidos.
   */
  private async syncChildren<
    TEntity extends PersistedChildEntity,
    TItem extends ChildItemWithId,
  >(
    manager: EntityManager,
    entityTarget: EntityTarget<TEntity>,
    recipeId: string,
    items: TItem[],
    mapFields: (item: TItem, position: number) => Partial<TEntity>,
  ): Promise<TEntity[]> {
    const repository = manager.getRepository(entityTarget);
    const existing = await repository.find({
      where: { recipeId } as unknown as FindOptionsWhere<TEntity>,
    });
    const existingById = new Map(existing.map((entity) => [entity.id, entity]));
    const keptIds = new Set<string>();

    const toSave = items.map((item, index) => {
      if (item.id) {
        const current = existingById.get(item.id);

        if (!current) {
          throw new BadRequestException(
            `Item com id ${item.id} não pertence a esta receita`,
          );
        }

        keptIds.add(item.id);
        return repository.create({
          ...current,
          ...mapFields(item, index),
        } as TEntity);
      }

      return repository.create({
        ...mapFields(item, index),
        recipeId,
      } as TEntity);
    });

    const toRemove = existing.filter((entity) => !keptIds.has(entity.id));

    if (toRemove.length) {
      await repository.remove(toRemove);
    }

    return repository.save(toSave);
  }
}
