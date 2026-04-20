import { IsDateString, IsInt, isInt, IsNotEmpty, IsString, Min } from "class-validator";

export class CreateMovieDto {
    @IsString()
    @IsNotEmpty()
    name?: string;

    @IsInt()
    @Min(1)
    duration?: number; // minutos

    @IsDateString({}, { message: 'date must be a valid ISO date (YYYY-MM-DD)' })
    date?: string;
}
