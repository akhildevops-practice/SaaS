import {
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class LocationDto {
  @IsNotEmpty()
  @IsString()
  locationName: string;

  @IsNotEmpty()
  @IsString()
  locationType: string;

  @IsNotEmpty()
  @IsString()
  locationId: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  organization: string;

  @IsNotEmpty()
  @IsString()
  business: string[];

  @IsNotEmpty()
  @IsArray()
  functionId: object[];

  @IsOptional()
  @IsArray()
  users: object[];

  @IsOptional()
  @IsString()
  businessTypeId: string;


  @IsOptional()
  @IsString()
  type: string;
}
