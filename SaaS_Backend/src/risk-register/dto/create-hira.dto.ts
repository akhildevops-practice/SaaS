import { IsArray, isNotEmpty, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateHiraDto {
  @IsNotEmpty()
  @IsString()
  jobTitle?: string;

  @IsNotEmpty()
  @IsString()
  categoryId?: string;

  @IsNotEmpty()
  @IsString()
  organizationId?: string;

  @IsNotEmpty()
  @IsString()
  locationId?: string;

  @IsNotEmpty()
  @IsString()
  entityId?: string;

  @IsOptional()
  @IsString()
  section?: string;

  @IsNotEmpty()
  @IsString()
  area?: string;

  @IsNotEmpty()
  @IsString()
  riskType?: string; //routine /non-routine [coming from hiraConfig schema]

  @IsNotEmpty()
  @IsString()
  condition?: string;  //normal /abnormal / emergency [coming from hiraConfig schema] 

  @IsNotEmpty()
  @IsArray()
  assesmentTeam?: [];

  @IsOptional()
  @IsString()
  additionalAssesmentTeam?: string;

  @IsOptional()
  @IsArray()
  stepIds?: [];


}
