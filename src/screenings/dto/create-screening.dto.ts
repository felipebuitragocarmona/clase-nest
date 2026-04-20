import { IsNotEmpty, IsISO8601 } from 'class-validator';
import { Movie } from 'src/movies/entities/movie.entity';
import { Theater } from 'src/theaters/entities/theater.entity';

export class CreateScreeningDto {
    @IsISO8601()
    date?: string; // "2024-10-20T18:00:00Z"

    @IsNotEmpty()
    movie?: Movie;
    
    @IsNotEmpty()
    theater?: Theater;
}