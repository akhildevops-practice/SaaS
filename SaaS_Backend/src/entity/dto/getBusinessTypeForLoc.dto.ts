import { IsNotEmpty, IsString } from 'class-validator';

export class BDto {
    @IsNotEmpty()
    @IsString()
    locId: string;

}