import { MigrationInterface, QueryRunner } from "typeorm";

export class InitCinemaSchema1776087285202 implements MigrationInterface {
    name = 'InitCinemaSchema1776087285202'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`projectors\` (\`id\` int NOT NULL AUTO_INCREMENT, \`brand\` varchar(255) NOT NULL, \`high\` int NOT NULL, \`width\` int NOT NULL, \`theater_id\` int NULL, UNIQUE INDEX \`REL_39723a507706f581bc5928ff8f\` (\`theater_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`seats\` (\`id\` int NOT NULL AUTO_INCREMENT, \`location\` varchar(255) NOT NULL, \`reclining\` tinyint NOT NULL, \`theater_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`projectors\` ADD CONSTRAINT \`FK_39723a507706f581bc5928ff8f3\` FOREIGN KEY (\`theater_id\`) REFERENCES \`theaters\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`seats\` ADD CONSTRAINT \`FK_0e2547501640e2c3c68c2036277\` FOREIGN KEY (\`theater_id\`) REFERENCES \`theaters\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`seats\` DROP FOREIGN KEY \`FK_0e2547501640e2c3c68c2036277\``);
        await queryRunner.query(`ALTER TABLE \`projectors\` DROP FOREIGN KEY \`FK_39723a507706f581bc5928ff8f3\``);
        await queryRunner.query(`DROP TABLE \`seats\``);
        await queryRunner.query(`DROP INDEX \`REL_39723a507706f581bc5928ff8f\` ON \`projectors\``);
        await queryRunner.query(`DROP TABLE \`projectors\``);
    }

}
