import { MigrationInterface, QueryRunner } from "typeorm";

export class InitCinemaSchema1776689459831 implements MigrationInterface {
    name = 'InitCinemaSchema1776689459831'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`movies\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`duration\` int NOT NULL, \`date\` date NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`screenings\` (\`id\` int NOT NULL AUTO_INCREMENT, \`date\` datetime NOT NULL, \`movie_id\` int NULL, \`theater_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`screenings\` ADD CONSTRAINT \`FK_540b3ebcebc8d837436ad0989bc\` FOREIGN KEY (\`movie_id\`) REFERENCES \`movies\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`screenings\` ADD CONSTRAINT \`FK_c2ba7ed0da823f76b931b3f92c6\` FOREIGN KEY (\`theater_id\`) REFERENCES \`theaters\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`screenings\` DROP FOREIGN KEY \`FK_c2ba7ed0da823f76b931b3f92c6\``);
        await queryRunner.query(`ALTER TABLE \`screenings\` DROP FOREIGN KEY \`FK_540b3ebcebc8d837436ad0989bc\``);
        await queryRunner.query(`DROP TABLE \`screenings\``);
        await queryRunner.query(`DROP TABLE \`movies\``);
    }

}
