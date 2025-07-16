import { Transform } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsNumber,
  IsDateString,
  IsArray,
} from 'class-validator';

export class ChartFilter {
  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  @IsString()
  documentId?: string;

  @IsOptional()
  @IsString()
  documentName?: string;

  @IsOptional()
  @IsString()
  documentType?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documentTypes?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  system?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documentStatus?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  role?: string[];

  @IsOptional()
  @IsString()
  readAccess?: string;

  @IsOptional()
  @IsString()
  documentIds?: string;

  @IsOptional()
  @IsString()
  documentTag?: string;

  @Transform(({ value }) => new Date(value).toDateString())
  @IsOptional()
  documentStartDate?: string;

  @Transform(({ value }) => new Date(value).toDateString())
  @IsOptional()
  documentEndDate?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  creator?: string;

  @IsOptional()
  @IsString()
  documentVersion?: string;

  @IsOptional()
  @IsString()
  searchQuery?: string;

  @Transform(({ value }) => Number(value))
  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  limit: number;

  @Transform(({ value }) => Number(value))
  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  page: number;

  @IsOptional()
  @IsString()
  organization?: string;

  @IsOptional()
  @IsArray()
  systemsArray?: string;

  @IsOptional()
  @IsArray()
  dept?: [];

  @IsOptional()
  @IsArray()
  loc?: [];
}
