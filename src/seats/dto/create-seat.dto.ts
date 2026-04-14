import { IsInt, Min } from 'class-validator';
import { BaseSeatDto } from './base-seat.dto';

export class CreateSeatDto extends BaseSeatDto {
    @IsInt()
    @Min(1)
    theater!: number;
}