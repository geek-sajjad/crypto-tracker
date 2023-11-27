import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1701083543399 implements MigrationInterface {
    name = 'Migration1701083543399'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."trackerTypeEnum" AS ENUM('increase', 'decrease')`);
        await queryRunner.query(`CREATE TABLE "tracker" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "cryptoName" character varying(10) NOT NULL, "priceThreshold" numeric(8,2) NOT NULL, "type" "public"."trackerTypeEnum" NOT NULL, "notifyEmail" character varying NOT NULL, CONSTRAINT "PK_83bc756baca3e744e999194bd51" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "tracker"`);
        await queryRunner.query(`DROP TYPE "public"."trackerTypeEnum"`);
    }

}
