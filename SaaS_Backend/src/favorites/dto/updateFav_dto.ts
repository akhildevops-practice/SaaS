import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class updateFav {
  @IsNotEmpty()
  @IsString()
  @IsArray()
  targetObjectId: string;
}
