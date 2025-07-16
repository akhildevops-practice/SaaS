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
export class createAuditSchedule {
  @IsNotEmpty()
  @IsString()
  auditScheduleName;

  @IsArray()
  @IsDate()
  @IsNotEmpty()
  auditPeriod;

  @IsNotEmpty()
  @IsString()
  auditYear;

  @IsNotEmpty()
  @IsString()
  status;

  @IsNotEmpty()
  @IsString()
  createdBy;

  @IsOptional()
  @IsString()
  updatedBy;

  @IsString()
  @IsOptional()
  auditTemplateId;

  @IsNotEmpty()
  @IsString()
  organizationId;

  @IsNotEmpty()
  @IsString()
  roleId;

  @IsNotEmpty()
  @IsString()
  entityTypeId;

  @IsOptional()
  @IsString()
  auditPlanId;

  @IsNotEmpty()
  @IsString()
  locationId;

  @IsNotEmpty()
  @IsString()
  systemTypeId;

  @IsNotEmpty()
  @IsString()
  systemMasterId;

  @IsOptional()
  @IsString()
  auditScheduleNumber;

  @IsOptional()
  @IsString()
  auditNumber;

  @IsString()
  auditType;

  @IsString()
  auditScheduleEntityWise;

  @IsString()
  prefixSuffix;

  @IsBoolean()
  useFunctionsForPlanning;

  @IsArray()
  selectedFunction;
}
