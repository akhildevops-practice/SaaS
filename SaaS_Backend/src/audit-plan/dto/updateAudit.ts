import { IsArray, IsDate, IsOptional, IsString } from 'class-validator';
export class updateAudit {
  @IsString()
  @IsOptional()
  auditName;

  @IsString()
  @IsOptional()
  status: string;

  @IsString()
  @IsOptional()
  location: string;

  @IsString()
  @IsOptional()
  comments: string;

  @IsString()
  @IsOptional()
  systemType: string;

  @IsString()
  @IsOptional()
  entityType: string;

  @IsDate()
  @IsOptional()
  publishedondate: Date;

  @IsString()
  @IsOptional()
  entity: string;

  @IsString()
  @IsOptional()
  AuditPlanEntitywise: string;

  @IsString()
  @IsOptional()
  roleName: string;

  @IsString()
  @IsOptional()
  systemMaster: string;

  @IsString()
  @IsOptional()
  organization: string;

  @IsString()
  @IsOptional()
  auditYear: string;

  @IsArray()
  @IsOptional()
  removedId: [string];
}
