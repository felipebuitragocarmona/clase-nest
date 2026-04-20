import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Movie } from '../../movies/entities/movie.entity';
import { Theater } from '../../theaters/entities/theater.entity';

@Entity('screenings')
export class Screening {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column({ type: 'datetime' })
    date?: Date;

    @ManyToOne(() => Movie, (movie) => movie.screenings, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'movie_id' })
    movie?: Movie;

    @ManyToOne(() => Theater, (theater) => theater.screenings, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'theater_id' })
    theater?: Theater;
}