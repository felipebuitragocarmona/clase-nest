import { IsString, IsNotEmpty, IsInt, Min } from 'class-validator';

export class BaseProjectorDto {
    @IsString()
    @IsNotEmpty()
    brand!: string;

    @IsInt()
    @Min(1)
    high!: number;

    @IsInt()
    @Min(1)
    width!: number;
}