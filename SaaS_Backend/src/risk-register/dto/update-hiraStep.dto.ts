import { IsString, IsOptional, IsNotEmpty, IsNumber, IsDate, IsIn } from 'class-validator';

export class UpdateHiraStepsDto {
  @IsNotEmpty()
  @IsNumber()
  sNo?: number;

  @IsNotEmpty()
  @IsString()
  subStepNo?: string;

  @IsNotEmpty()
  @IsString()
  jobBasicStep: string;

  @IsNotEmpty()
  @IsString()
  hazardType: string;

  @IsNotEmpty()
  @IsString()
  hazardDescription: string;

  @IsNotEmpty()
  @IsString()
  impactText: string;

  @IsNotEmpty()
  @IsString()
  existingControl: string;

  @IsOptional()
  @IsNumber()
  preSeverity?: number;

  @IsOptional()
  @IsNumber()
  preProbability?: number;

  @IsOptional()
  @IsNumber()
  preMitigationScore?: number;

  @IsOptional()
  @IsString()
  additionalControlMeasure?: string;

  @IsOptional()
  @IsString()
  responsiblePerson?: string;

  @IsOptional()
  @IsString()
  implementationStatus?: string;

  @IsOptional()
  @IsNumber()
  postSeverity?: number;

  @IsOptional()
  @IsNumber()
  postProbability?: number;

  @IsOptional()
  @IsString()
  workflowStatus?: string;

  @IsOptional()
  @IsString()
  hiraId?: string;

  @IsOptional()
  @IsNumber()
  postMitigationScore?: number;

  @IsOptional()
  @IsString()
  locationId?: string;

  @IsOptional()
  @IsString()
  entityId?: string;
}
