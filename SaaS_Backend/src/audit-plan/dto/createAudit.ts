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
export class createAudit {
  @IsNotEmpty()
  @IsString()
  auditName;

  @IsNotEmpty()
  @IsString()
  auditYear;

  @IsNotEmpty()
  @IsString()
  status;

  @IsOptional()
  @IsString()
  version;

  @IsNotEmpty()
  @IsString()
  createdBy;

  @IsOptional()
  @IsString()
  updatedBy;

  @IsNotEmpty()
  @IsString()
  systemType;

  @IsNotEmpty()
  @IsString()
  scope;

  @IsOptional()
  @IsString()
  comments;

  @IsNotEmpty()
  @IsString()
  location;

  @IsOptional()
  @IsString()
  organization;

  @IsNotEmpty()
  @IsObject()
  AuditPlanEntitywise;

  @IsNotEmpty()
  @IsString()
  role: any;

  @IsNotEmpty()
  @IsString()
  systemName;

  @IsBoolean()
  isDraft;
}
