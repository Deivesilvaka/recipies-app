import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersAndVerification1784403404628 implements MigrationInterface {
    name = 'CreateUsersAndVerification1784403404628'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "verification" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "user_id" character varying(36) NOT NULL, "token" character varying NOT NULL, "expired_at" TIMESTAMP NOT NULL, CONSTRAINT "PK_f7e3a90ca384e71d6e2e93bb340" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying(100) NOT NULL, "birthdate" character varying(10) NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "phone_number" character varying NOT NULL, "is_terms_accepted" boolean NOT NULL DEFAULT true, "is_activated" boolean NOT NULL DEFAULT false, "email_validated_at" TIMESTAMP, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "verification"`);
    }

}
