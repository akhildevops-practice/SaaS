import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class AuditFieldSchema {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  inputType: string;

  @IsNotEmpty()
  @IsBoolean()
  open: boolean;

  @IsNotEmpty()
  @IsBoolean()
  required: boolean;

  @IsNotEmpty()
  @IsBoolean()
  allowImageUpload: boolean;

  @IsNotEmpty()
  value: any;

  @IsString()
  hint: string;

  options?: [any];

  image?: any;
}

class AuditSection {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsNumber()
  totalScore: number;

  @IsNotEmpty()
  @IsNumber()
  obtainedScore: number;

  @ArrayNotEmpty()
  fieldset: [AuditFieldSchema];
}

export class CreateAuditTemplateDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsBoolean()
  isDraft: boolean;

  @IsNotEmpty()
  @IsBoolean()
  status: boolean;

  @IsString()
  publishedDate: string;

  @ArrayNotEmpty()
  sections: [AuditSection];

  @IsString()
  @IsOptional()
  createdBy: string;

  @IsString()
  organizationId: string;
}
