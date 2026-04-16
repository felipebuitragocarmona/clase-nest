import { IsOptional} from 'class-validator';
import { BaseSeatDto } from './base-seat.dto';
import { Theater } from 'src/theaters/entities/theater.entity';

export class CreateSeatDto extends BaseSeatDto {
    @IsOptional()
    theater?: Theater;
}