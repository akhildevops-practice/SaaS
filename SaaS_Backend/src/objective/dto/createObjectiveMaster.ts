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
export class CreateObjectMaster {
  @IsNotEmpty()
  @IsString()
  ObjectiveName;

  @IsNotEmpty()
  @IsString()
  ObjectiveId;

  @IsOptional()
  @IsArray()
  ObjectiveCategory;

  @IsOptional()
  @IsString()
  locationId;

  @IsOptional()
  @IsString()
  Description;

  @IsOptional()
  @IsString()
  resources;
  @IsOptional()
  @IsString()
  evaluationProcess;

  @IsOptional()
  @IsString()
  systemTypes;

  @IsOptional()
  @IsString()
  Reason;

  @IsNotEmpty()
  @IsString()
  ObjectivePeriod;

  @IsNotEmpty()
  @IsString()
  EntityTypeId;

  @IsOptional()
  @IsString()
  ObjectiveType;

  @IsNotEmpty()
  @IsArray()
  ObjectiveLinkedId;

  @IsNotEmpty()
  @IsBoolean()
  ObjectiveStatus;

  @IsOptional()
  @IsBoolean()
  ObjectivedocStatus: any;

  @IsOptional()
  @IsString()
  Readers;

  @IsOptional()
  @IsArray()
  ReadersList;

  @IsOptional()
  @IsString()
  @IsArray()
  ReviewList;

  @IsOptional()
  @IsString()
  @IsArray()
  Objective;

  @IsNotEmpty()
  @IsString()
  ReviewComments;

  @IsOptional()
  @IsString()
  Review;

  @IsOptional()
  @IsString()
  Owner;

  @IsOptional()
  @IsString()
  OwnerShipType;

  @IsOptional()
  @IsString()
  OwnershipEntity;

  @IsOptional()
  @IsString()
  MilestonePeriod;

  @IsOptional()
  @IsString()
  ParentObjective;

  @IsOptional()
  @IsString()
  Scope;

  @IsOptional()
  @IsString()
  ScopeType;

  @IsObject()
  createdBy;

  @IsObject()
  associatedKpis;

  @IsOptional()
  @IsString()
  ScopeDetails?: object;

  @IsOptional()
  @IsString()
  Goals;
}
