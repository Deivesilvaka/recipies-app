import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRecipes1790519853565 implements MigrationInterface {
    name = 'CreateRecipes1790519853565'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "recipe_ingredients" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "recipe_id" uuid NOT NULL, "description" character varying(255) NOT NULL, "position" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_8f15a314e55970414fc92ffb532" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "recipe_instructions" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "recipe_id" uuid NOT NULL, "description" text NOT NULL, "position" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_a0ea9c4419134f16d05cb3258c1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "recipe_visual_steps" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "recipe_id" uuid NOT NULL, "step_number" integer NOT NULL, "description" text NOT NULL, "image_url" character varying, CONSTRAINT "PK_360aad2955c6c79858b89667c9a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "recipe_chef_tips" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "recipe_id" uuid NOT NULL, "description" text NOT NULL, "position" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_a19cbd954d1623b564764124c09" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "recipes" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "title" character varying(255) NOT NULL, "subtitle" character varying(500), "category" character varying(100) NOT NULL, "prep_time_minutes" integer NOT NULL, "servings" integer NOT NULL, "portion_reference" character varying(255), "badges" text array NOT NULL DEFAULT '{}', "main_image_url" character varying, "owner_id" uuid NOT NULL, "calories_kcal" integer NOT NULL, "proteins_grams" integer NOT NULL, "carbohydrates_grams" integer NOT NULL, "fats_grams" integer NOT NULL, "fibers_grams" integer NOT NULL, "sodium_mg" integer NOT NULL, CONSTRAINT "PK_8f09680a51bf3669c1598a21682" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()`);
        await queryRunner.query(`ALTER TABLE "verification" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "verification" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()`);
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
        await queryRunner.query(`ALTER TABLE "verification" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "verification" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`DROP TABLE "recipes"`);
        await queryRunner.query(`DROP TABLE "recipe_chef_tips"`);
        await queryRunner.query(`DROP TABLE "recipe_visual_steps"`);
        await queryRunner.query(`DROP TABLE "recipe_instructions"`);
        await queryRunner.query(`DROP TABLE "recipe_ingredients"`);
    }

}
