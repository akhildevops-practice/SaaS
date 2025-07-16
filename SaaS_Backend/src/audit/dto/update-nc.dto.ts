import { IsString } from "class-validator"

export class UpdateNcDto {
    
    @IsString()
    creator?: string;

    @IsString()
    type: string

    @IsString()
    comment: string;

    @IsString()
    clause: string;

    @IsString()
    severity: string;

    @IsString()
    status: string;
}