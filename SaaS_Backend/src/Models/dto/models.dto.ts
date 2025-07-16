import { IsNotEmpty, IsString } from 'class-validator';

export class ModelDto {
  @IsNotEmpty()
  @IsString()
  modelName: string;

  @IsNotEmpty()
  @IsString()
  modelNo: string;

  @IsNotEmpty()
  @IsString()
  organization: string;


  @IsString()
  description: string;
}
