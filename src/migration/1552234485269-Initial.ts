import {MigrationInterface, QueryRunner} from "typeorm";

export class Initial1552234485269 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "Score" ("id" int NOT NULL IDENTITY(1,1), "Name" nvarchar(50) NOT NULL, "SubmittedDate" datetime2 NOT NULL CONSTRAINT "DF_6a1da8f074e18d7cc59793bdabe" DEFAULT getdate(), "Score" int NOT NULL, "Lines" int NOT NULL, "Replay" ntext NOT NULL, CONSTRAINT "PK_ddafa597238423c15a407ce5b9b" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP TABLE "Score"`);
    }

}
