import { IsArray, IsBoolean, IsDate, IsNotEmpty, IsObject, IsOptional, IsString,ValidateNested } from 'class-validator';
export class createOwnerComments {

    @IsNotEmpty()
    @IsString()
    ReviewComments

    @IsNotEmpty()
    @IsString()
    ObjectiveId

}