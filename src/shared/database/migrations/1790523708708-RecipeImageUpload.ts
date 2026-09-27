import { MigrationInterface, QueryRunner } from "typeorm";

export class RecipeImageUpload1790523708708 implements MigrationInterface {
    name = 'RecipeImageUpload1790523708708'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recipes" RENAME COLUMN "main_image_url" TO "main_image_path"`);
        await queryRunner.query(`ALTER TABLE "recipe_visual_steps" DROP COLUMN "image_url"`);
        await queryRunner.query(`ALTER TABLE "verification" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "verification" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()`);
        await queryRunner.query(`ALTER TABLE "recipes" DROP CONSTRAINT "FK_71bb8421d7219197f9e8150342d"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()`);
        await queryRunner.query(`ALTER TABLE "recipe_ingredients" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "recipe_ingredients" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()`);
        await queryRunner.query(`ALTER TABLE "recipe_instructions" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "recipe_instructions" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()`);
        await queryRunner.query(`ALTER TABLE "recipe_chef_tips" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "recipe_chef_tips" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()`);
        await queryRunner.query(`ALTER TABLE "recipe_ingredients" DROP CONSTRAINT "FK_f240137e0e13bed80bdf64fed53"`);
        await queryRunner.query(`ALTER TABLE "recipe_instructions" DROP CONSTRAINT "FK_82b113a050a6f0c0d146d4f3b85"`);
        await queryRunner.query(`ALTER TABLE "recipe_visual_steps" DROP CONSTRAINT "FK_69b53105c426bb6a28b380ec539"`);
        await queryRunner.query(`ALTER TABLE "recipe_chef_tips" DROP CONSTRAINT "FK_4e3e10c76c8c6616a6bff1d5d3d"`);
        await queryRunner.query(`ALTER TABLE "recipes" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "recipes" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()`);
        await queryRunner.query(`ALTER TABLE "recipe_visual_steps" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "recipe_visual_steps" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()`);
        await queryRunner.query(`ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "FK_f240137e0e13bed80bdf64fed53" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recipe_instructions" ADD CONSTRAINT "FK_82b113a050a6f0c0d146d4f3b85" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recipe_chef_tips" ADD CONSTRAINT "FK_4e3e10c76c8c6616a6bff1d5d3d" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recipes" ADD CONSTRAINT "FK_71bb8421d7219197f9e8150342d" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recipe_visual_steps" ADD CONSTRAINT "FK_69b53105c426bb6a28b380ec539" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recipe_visual_steps" DROP CONSTRAINT "FK_69b53105c426bb6a28b380ec539"`);
        await queryRunner.query(`ALTER TABLE "recipes" DROP CONSTRAINT "FK_71bb8421d7219197f9e8150342d"`);
        await queryRunner.query(`ALTER TABLE "recipe_chef_tips" DROP CONSTRAINT "FK_4e3e10c76c8c6616a6bff1d5d3d"`);
        await queryRunner.query(`ALTER TABLE "recipe_instructions" DROP CONSTRAINT "FK_82b113a050a6f0c0d146d4f3b85"`);
        await queryRunner.query(`ALTER TABLE "recipe_ingredients" DROP CONSTRAINT "FK_f240137e0e13bed80bdf64fed53"`);
        await queryRunner.query(`ALTER TABLE "recipe_visual_steps" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "recipe_visual_steps" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "recipes" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "recipes" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "recipe_chef_tips" ADD CONSTRAINT "FK_4e3e10c76c8c6616a6bff1d5d3d" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recipe_visual_steps" ADD CONSTRAINT "FK_69b53105c426bb6a28b380ec539" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recipe_instructions" ADD CONSTRAINT "FK_82b113a050a6f0c0d146d4f3b85" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "FK_f240137e0e13bed80bdf64fed53" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recipe_chef_tips" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "recipe_chef_tips" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "recipe_instructions" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "recipe_instructions" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "recipe_ingredients" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "recipe_ingredients" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "recipes" ADD CONSTRAINT "FK_71bb8421d7219197f9e8150342d" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "verification" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "verification" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "recipe_visual_steps" ADD "image_url" character varying`);
        await queryRunner.query(`ALTER TABLE "recipes" RENAME COLUMN "main_image_path" TO "main_image_url"`);
    }

}
