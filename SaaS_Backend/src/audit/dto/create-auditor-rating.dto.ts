import {IsNumber, IsString} from "class-validator"


export class CreateAuditorRating { 

    @IsString()
    user: string;

    @IsNumber()
    rating: number;

    @IsString()
    comment: string;
}