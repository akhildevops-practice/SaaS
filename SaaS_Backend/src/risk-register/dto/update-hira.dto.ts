import { IsArray, isNotEmpty, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateHiraDto {

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

}
