import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
export class UpdateDoctypeDto {
  @IsNotEmpty()
  @IsString()
  documentTypeName?: string;

  @IsNotEmpty()
  @IsString()
  documentNumbering: string;
  @IsNotEmpty()
  @IsNumber()
  reviewFrequency?: number;
  @IsNotEmpty()
  @IsNumber()
  revisionRemind?: number;

  @IsNotEmpty()
  @IsString()
  prefix: string[];

  @IsNotEmpty()
  @IsString()
  suffix: string[];

  @IsNotEmpty()
  readAccess: any;

  @IsOptional()
  @IsArray()
  applicable_locations?: any;

  @IsOptional()
  @IsNotEmpty()
  docReadAccess: any;

  @IsOptional()
  @IsArray()
  docReadAccessIds?: string[];

  @IsOptional()
  @IsNotEmpty()
  whoCanDownload: any;

  @IsOptional()
  @IsArray()
  whoCanDownloadIds?: string[];

  @IsOptional()
  @IsNotEmpty()
  docCreateAccess: any;

  @IsOptional()
  @IsArray()
  docCreateAccessIds?: string[];

  @IsArray()
  applicable_systems: string[];

  @IsOptional()
  @IsString()
  currentVersion: string;

  @IsString()
  userId?: string;

  @IsBoolean()
  default: boolean;
}
