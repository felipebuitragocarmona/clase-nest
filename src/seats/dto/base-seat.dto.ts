import { IsString, IsNotEmpty, IsBoolean } from 'class-validator';

export class BaseSeatDto {
    @IsString()
    @IsNotEmpty()
    location?: string;

    @IsBoolean()
    reclining?: boolean;
}