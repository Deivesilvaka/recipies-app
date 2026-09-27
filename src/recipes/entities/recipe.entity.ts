import { BaseEntity } from '@src/shared/database/base.entity';
import { UserEntity } from '@src/users/entities/user.entity';
import { RecipeBadge } from '@src/recipes/constants/recipe-badge.enum';
import { RecipeNutritionalInfo } from '@src/recipes/entities/recipe-nutritional-info.embeddable';
import { RecipeIngredientEntity } from '@src/recipes/entities/recipe-ingredient.entity';
import { RecipeInstructionEntity } from '@src/recipes/entities/recipe-instruction.entity';
import { RecipeVisualStepEntity } from '@src/recipes/entities/recipe-visual-step.entity';
import { RecipeChefTipEntity } from '@src/recipes/entities/recipe-chef-tip.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Entity('recipes')
export class RecipeEntity extends BaseEntity {
  @Column({ name: 'title', type: 'varchar', length: 255, nullable: false })
  title: string;

  @Column({ name: 'subtitle', type: 'varchar', length: 500, nullable: true })
  subtitle: string | null;

  @Column({ name: 'category', type: 'varchar', length: 100, nullable: true })
  category: string | null;

  @Column({ name: 'prep_time_minutes', type: 'int', nullable: false })
  prepTimeMinutes: number;

  @Column({ name: 'servings', type: 'int', nullable: false })
  servings: number;

  @Column({
    name: 'portion_reference',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  portionReference: string | null;

  @Column({ name: 'badges', type: 'text', array: true, default: '{}' })
  badges: RecipeBadge[];

  @Column({ name: 'main_image_path', type: 'varchar', nullable: true })
  mainImagePath: string | null;

  @Column({ name: 'owner_id', type: 'uuid', nullable: false })
  ownerId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner?: UserEntity;

  @Column(() => RecipeNutritionalInfo, { prefix: '' })
  nutritionalInfo: RecipeNutritionalInfo;

  @OneToMany(
    () => RecipeIngredientEntity,
    (ingredient) => ingredient.recipe,
    { cascade: true },
  )
  ingredients: RecipeIngredientEntity[];

  @OneToMany(
    () => RecipeInstructionEntity,
    (instruction) => instruction.recipe,
    { cascade: true },
  )
  instructions: RecipeInstructionEntity[];

  @OneToMany(
    () => RecipeVisualStepEntity,
    (visualStep) => visualStep.recipe,
    { cascade: true },
  )
  visualSteps: RecipeVisualStepEntity[];

  @OneToMany(() => RecipeChefTipEntity, (chefTip) => chefTip.recipe, {
    cascade: true,
  })
  chefTips: RecipeChefTipEntity[];
}
