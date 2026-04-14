import { IsOptional } from "class-validator";
import { BaseProjectorDto } from "./base-projector.dto";
import { Theater } from "src/theaters/entities/theater.entity";



export class CreateProjectorDto extends BaseProjectorDto {
    @IsOptional()
    theater?: Theater;
}