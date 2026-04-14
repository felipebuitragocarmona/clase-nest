import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Theater } from '../../theaters/entities/theater.entity';

@Entity('seats')
export class Seat {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    location?: string;

    @Column()
    reclining?: boolean;

    @ManyToOne(() => Theater, (theater) => theater.seats, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'theater_id' })
    theater?: Theater;
}