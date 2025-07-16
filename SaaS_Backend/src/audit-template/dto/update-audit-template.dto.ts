import { PartialType } from '@nestjs/mapped-types';
import { CreateAuditTemplateDto } from './create-audit-template.dto';

import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsBoolean,
  IsNotEmpty,
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
  @IsString()
  value: string;

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

  @ArrayNotEmpty()
  fieldset: [AuditFieldSchema];
}

export class UpdateAuditTemplateDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsBoolean()
  isDraft?: boolean;

  @IsBoolean()
  status?: boolean;

  @IsString()
  publishedDate: string;

  @IsString()
  createdBy: string;

  @ArrayNotEmpty()
  sections?: [AuditSection];
}
