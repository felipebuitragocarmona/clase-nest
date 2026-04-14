import { Projector } from 'src/projectors/entities/projector.entity';
import { Seat } from 'src/seats/entities/seat.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToOne, OneToMany } from 'typeorm';

@Entity('theaters')
export class Theater {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    location?: string;

    @Column()
    capacity?: number;

    @OneToOne(() => Projector, (projector) => projector.theater, { cascade: false })
    projector?: Projector;

    @OneToMany(() => Seat, (seat) => seat.theater, { cascade: true })
    seats!: Seat[];
}