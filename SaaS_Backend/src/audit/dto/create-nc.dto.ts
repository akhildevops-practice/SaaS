import { IsArray, IsNumber, IsString, isString } from 'class-validator';

export class CreateNcDto {
  @IsString()
  id?: string;

  @IsString()
  audit: string;

  @IsString()
  findingTypeId: string;

  @IsString()
  creator: string;

  @IsString()
  type: string;

  @IsString()
  comment: string;

  @IsString()
  clause: string;

  @IsString()
  severity: string;

  @IsString()
  status: string;

  @IsString()
  document: string;

  @IsNumber()
  questionNumber: number;

  @IsString()
  serialNumberGen: string;

  @IsNumber()
  serialNumber: number;

  @IsString()
  organization: string;

  @IsArray()
  system: [String];

  @IsArray()
  auditors: string[];

  @IsArray()
  auditees: string[];

  @IsString()
  auditedEntity:string

  @IsString()
  sectionFindingId:string
}
