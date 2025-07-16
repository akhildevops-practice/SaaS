import { IsArray, IsBoolean, IsDate, IsOptional, IsString } from 'class-validator';

export class updateAuditSchedule {
  @IsString()
  @IsOptional()
  auditScheduleName;

  @IsDate()
  @IsArray()
  @IsOptional()
  auditPeriod;

  @IsString()
  @IsOptional()
  auditYear;

  @IsString()
  @IsOptional()
  status;

  @IsString()
  @IsOptional()
  auditTemplate;

  @IsString()
  @IsOptional()
  roleName;

  @IsString()
  @IsOptional()
  entityTypeName;

  @IsString()
  @IsOptional()
  location;

  @IsString()
  @IsOptional()
  systemTypeName;

  @IsString()
  @IsOptional()
  systemMaster;

  @IsOptional()
  @IsString()
  auditScheduleNumber;

  @IsString()
  @IsOptional()
  auditScheduleEntityWise;

  @IsString()
  @IsOptional()
  prefixSuffix;

  @IsBoolean()
  useFunctionsForPlanning;
}
