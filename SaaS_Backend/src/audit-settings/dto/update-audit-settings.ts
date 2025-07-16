import { IsOptional, IsString } from 'class-validator';

export class UpdateAuditSettings {
  @IsString()
  @IsOptional()
  auditType: string;

  @IsString()
  @IsOptional()
  Description: string;
}
