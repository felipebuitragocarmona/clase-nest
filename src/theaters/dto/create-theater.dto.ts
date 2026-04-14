import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, Max, MaxLength, maxLength, Min, MinLength, ValidateNested } from 'class-validator';
import { CreateTheaterProjectorDto } from 'src/projectors/dto/create-theater-projector.dto';
import { CreateTheaterSeatDto } from 'src/seats/dto/create-theater-seat.dto';

export class CreateTheaterDto {
    @IsString()
    @MinLength(3)
    @MaxLength(255)
    location?: string;

    @IsInt()
    @Min(1)
    @Max(200)
    capacity?: number;

    @IsOptional()
	@ValidateNested()
	@Type(() => CreateTheaterProjectorDto)
	projector?: CreateTheaterProjectorDto;

    @IsOptional()
	@ValidateNested()
	@Type(() => CreateTheaterSeatDto)
	seats?: CreateTheaterSeatDto[];
}