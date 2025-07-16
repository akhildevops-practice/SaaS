import { IsNotEmpty, IsString } from 'class-validator';

export class LocationAdminDto {
    @IsNotEmpty()
    @IsString()
    realm?: string;
  
    @IsNotEmpty()
    @IsString()
    username?: string;
  
    @IsNotEmpty()
    @IsString()
    firstName: string;
  
    @IsNotEmpty()
    @IsString()
    lastName: string;
  
    @IsNotEmpty()
    @IsString()
    email: string;
}