import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { RecipeEntity } from '@src/recipes/entities/recipe.entity';

@Entity('recipe_visual_steps')
export class RecipeVisualStepEntity {
  @PrimaryColumn({ type: 'uuid', default: () => 'gen_random_uuid()' })
  id: string;

  @Column({ name: 'recipe_id', type: 'uuid' })
  recipeId: string;

  @Column({ name: 'step_number', type: 'int' })
  stepNumber: number;

  @Column({ name: 'description', type: 'text' })
  description: string;

  @ManyToOne(() => RecipeEntity, (recipe) => recipe.visualSteps, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'recipe_id' })
  recipe?: RecipeEntity;
}
