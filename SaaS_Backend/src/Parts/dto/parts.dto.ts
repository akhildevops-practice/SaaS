import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { ModelDto } from 'src/Models/dto/models.dto';

export class PartsDto {
  @IsNotEmpty()
  @IsString()
  partName: string;

  @IsNotEmpty()
  @IsString()
  partNo: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  entity: string;

  @IsArray()
  models: [];
}
