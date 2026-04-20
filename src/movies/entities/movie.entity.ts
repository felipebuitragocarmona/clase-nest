import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Screening } from '../../screenings/entities/screening.entity';

@Entity('movies')
export class Movie {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    name?: string;

    @Column()
    duration?: number; // minutos

    @Column({ type: 'date' })
    date?: Date;

    @OneToMany(() => Screening, (screening) => screening.movie)
    screenings?: Screening[];
}