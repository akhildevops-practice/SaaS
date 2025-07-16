import { IsArray, IsBoolean, IsNotEmpty, IsString } from 'class-validator';


export class CreateSystemDto {
  @IsString()
  @IsNotEmpty()
  organizationId: string;

  @IsString()
  @IsNotEmpty()
  riskCategory: string;

  @IsArray()
  riskType: Array<any>;

  @IsArray()
  hiraMatrixHeader: Array<any>;

  @IsArray()
  hiraMatrixData: Array<any>;

  @IsArray()
  riskLevelData: Array<any>;

  @IsString()
  @IsNotEmpty()
  createdBy: string;

}
