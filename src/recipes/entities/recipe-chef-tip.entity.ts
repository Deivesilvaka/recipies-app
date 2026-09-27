import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { RecipeEntity } from '@src/recipes/entities/recipe.entity';

@Entity('recipe_chef_tips')
export class RecipeChefTipEntity {
  @PrimaryColumn({ type: 'uuid', default: () => 'gen_random_uuid()' })
  id: string;

  @Column({ name: 'recipe_id', type: 'uuid' })
  recipeId: string;

  @Column({ name: 'description', type: 'text' })
  description: string;

  @Column({ name: 'position', type: 'int', default: 0 })
  position: number;

  @ManyToOne(() => RecipeEntity, (recipe) => recipe.chefTips, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'recipe_id' })
  recipe?: RecipeEntity;
}
