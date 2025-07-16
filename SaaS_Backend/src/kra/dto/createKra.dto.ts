import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class createKra {
  @IsString()
  @IsNotEmpty()
  KraName;

  @IsString()
  @IsNotEmpty()
  ObjectiveId;

  @IsString()
  @IsNotEmpty()
  objective;
  @IsString()
  @IsNotEmpty()
  Target;

  @IsString()
  @IsNotEmpty()
  TargetType;

  @IsString()
  @IsNotEmpty()
  UnitOfMeasure;

  @IsDate()
  @IsNotEmpty()
  TargetDate;

  @IsDate()
  @IsNotEmpty()
  StartDate;

  @IsDate()
  @IsNotEmpty()
  EndDate;

  @IsBoolean()
  @IsNotEmpty()
  Status;

  @IsString()
  @IsNotEmpty()
  Comments;
  @IsString()
  @IsNotEmpty()
  description;
  @IsString()
  @IsNotEmpty()
  UserName;

  @IsString()
  @IsNotEmpty()
  ForEntity;

  @IsArray()
  @IsNotEmpty()
  KpiReportId;

  @IsString()
  @IsNotEmpty()
  objectiveCategories;

  @IsArray()
  associatedKpis;
}
