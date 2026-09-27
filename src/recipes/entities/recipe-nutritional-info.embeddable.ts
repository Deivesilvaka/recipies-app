import { Column } from 'typeorm';

export class RecipeNutritionalInfo {
  @Column({ name: 'calories_kcal', type: 'int', nullable: true })
  caloriesKcal: number | null;

  @Column({ name: 'proteins_grams', type: 'int', nullable: true })
  proteinsGrams: number | null;

  @Column({ name: 'carbohydrates_grams', type: 'int', nullable: true })
  carbohydratesGrams: number | null;

  @Column({ name: 'fats_grams', type: 'int', nullable: true })
  fatsGrams: number | null;

  @Column({ name: 'fibers_grams', type: 'int', nullable: true })
  fibersGrams: number | null;

  @Column({ name: 'sodium_mg', type: 'int', nullable: true })
  sodiumMg: number | null;
}
