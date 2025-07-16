import { IsNotEmpty, IsString, IsArray, IsOptional } from 'class-validator';

export class CreateFavDTO {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  targetObject: string;

  @IsNotEmpty()
  @IsString()
  @IsArray()
  targetObjectId: string;

  @IsNotEmpty()
  @IsString()
  @IsArray()
  organizationId: string;
}
