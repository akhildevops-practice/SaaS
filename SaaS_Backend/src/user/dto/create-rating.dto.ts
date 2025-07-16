import {IsNumber, IsString} from "class-validator"


export class CreateUserRating { 

    @IsString()
    userId: string;

    @IsNumber()
    rating: number;

    @IsString()
    comment: string;
}