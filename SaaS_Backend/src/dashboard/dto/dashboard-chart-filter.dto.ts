import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsIn,
  IsDateString,
} from 'class-validator';
import { Transform } from 'class-transformer';
const FieldType = ['documentType', 'documentState', 'readAccess', 'tags'];

const FieldMap = {
  documentStatus: 'documentState',
  documentAccess: 'readAccess',
  documentTags: 'tags',
}; 
export class ChartFilter {
  @IsNotEmpty()
  @IsIn(FieldType)
  @Transform(({ value }) => {
    return FieldMap[value] ?? value;
  })
  filterField; @IsOptional()
  @IsString()
  location?: string; @IsOptional()
  @IsString()
  department?: string; @IsOptional()
  @IsString()
  creator?: string; @IsOptional()
  @IsDateString()
  documentStartDate?: string; @IsOptional()
  @IsDateString()
  documentEndDate?: string;
}