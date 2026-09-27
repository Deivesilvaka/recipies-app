import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeRecipeCategoryAndNutritionalInfoOptional1790520621900 implements MigrationInterface {
    name = 'MakeRecipeCategoryAndNutritionalInfoOptional1790520621900'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "verification" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "verification" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()`);
        await queryRunner.query(`ALTER TABLE "recipes" DROP CONSTRAINT "FK_71bb8421d7219197f9e8150342d"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()`);
        await queryRunner.query(`ALTER TABLE "recipe_ingredients" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "recipe_ingredients" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()`);
        await queryRunner.query(`ALTER TABLE "recipe_instructions" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "recipe_instructions" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()`);
        await queryRunner.query(`ALTER TABLE "recipe_visual_steps" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "recipe_visual_steps" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()`);
        await queryRunner.query(`ALTER TABLE "recipe_chef_tips" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "recipe_chef_tips" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()`);
        await queryRunner.query(`ALTER TABLE "recipe_ingredients" DROP CONSTRAINT "FK_f240137e0e13bed80bdf64fed53"`);
        await queryRunner.query(`ALTER TABLE "recipe_instructions" DROP CONSTRAINT "FK_82b113a050a6f0c0d146d4f3b85"`);
        await queryRunner.query(`ALTER TABLE "recipe_visual_steps" DROP CONSTRAINT "FK_69b53105c426bb6a28b380ec539"`);
        await queryRunner.query(`ALTER TABLE "recipe_chef_tips" DROP CONSTRAINT "FK_4e3e10c76c8c6616a6bff1d5d3d"`);
        await queryRunner.query(`ALTER TABLE "recipes" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "recipes" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()`);
        await queryRunner.query(`ALTER TABLE "recipes" ALTER COLUMN "category" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "recipes" ALTER COLUMN "calories_kcal" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "recipes" ALTER COLUMN "proteins_grams" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "recipes" ALTER COLUMN "carbohydrates_grams" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "recipes" ALTER COLUMN "fats_grams" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "recipes" ALTER COLUMN "fibers_grams" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "recipes" ALTER COLUMN "sodium_mg" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "FK_f240137e0e13bed80bdf64fed53" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recipe_instructions" ADD CONSTRAINT "FK_82b113a050a6f0c0d146d4f3b85" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recipe_visual_steps" ADD CONSTRAINT "FK_69b53105c426bb6a28b380ec539" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recipe_chef_tips" ADD CONSTRAINT "FK_4e3e10c76c8c6616a6bff1d5d3d" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recipes" ADD CONSTRAINT "FK_71bb8421d7219197f9e8150342d" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recipes" DROP CONSTRAINT "FK_71bb8421d7219197f9e8150342d"`);
        await queryRunner.query(`ALTER TABLE "recipe_chef_tips" DROP CONSTRAINT "FK_4e3e10c76c8c6616a6bff1d5d3d"`);
        await queryRunner.query(`ALTER TABLE "recipe_visual_steps" DROP CONSTRAINT "FK_69b53105c426bb6a28b380ec539"`);
        await queryRunner.query(`ALTER TABLE "recipe_instructions" DROP CONSTRAINT "FK_82b113a050a6f0c0d146d4f3b85"`);
        await queryRunner.query(`ALTER TABLE "recipe_ingredients" DROP CONSTRAINT "FK_f240137e0e13bed80bdf64fed53"`);
        await queryRunner.query(`ALTER TABLE "recipes" ALTER COLUMN "sodium_mg" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "recipes" ALTER COLUMN "fibers_grams" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "recipes" ALTER COLUMN "fats_grams" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "recipes" ALTER COLUMN "carbohydrates_grams" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "recipes" ALTER COLUMN "proteins_grams" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "recipes" ALTER COLUMN "calories_kcal" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "recipes" ALTER COLUMN "category" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "recipes" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "recipes" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "recipe_chef_tips" ADD CONSTRAINT "FK_4e3e10c76c8c6616a6bff1d5d3d" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recipe_visual_steps" ADD CONSTRAINT "FK_69b53105c426bb6a28b380ec539" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recipe_instructions" ADD CONSTRAINT "FK_82b113a050a6f0c0d146d4f3b85" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "FK_f240137e0e13bed80bdf64fed53" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recipe_chef_tips" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "recipe_chef_tips" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "recipe_visual_steps" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "recipe_visual_steps" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "recipe_instructions" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "recipe_instructions" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "recipe_ingredients" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "recipe_ingredients" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "recipes" ADD CONSTRAINT "FK_71bb8421d7219197f9e8150342d" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "verification" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "verification" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
    }

}
