import { Theater } from 'src/theaters/entities/theater.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';

@Entity('projectors')
export class Projector {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    brand?: string;

    @Column()
    high?: number;

    @Column()
    width?: number;

    @OneToOne(() => Theater, (theater) => theater.projector)
    @JoinColumn({ name: 'theater_id' })
    theater?: Theater;
}