import { Transform } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsNumber,
  IsDateString,
  IsArray,
} from 'class-validator';

export class DocumentChartFilter {

  @IsOptional()
  @IsString()
  documentType?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documentStatus?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  system?: string[];


  @IsOptional()
  @IsString()
  searchQuery?: string;

  @IsOptional()
  @IsString()
  organization?: string;

  @IsOptional()
  @IsString()
  locationId?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  creator?: string;
}
