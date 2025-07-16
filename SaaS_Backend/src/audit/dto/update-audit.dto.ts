import { IsArray, IsBoolean, IsNumber, IsString } from 'class-validator';

class NC {
  @IsString()
  creator: string;

  @IsString()
  type: string;

  @IsString()
  goodPractices: string;
  @IsString()
  comment: string;

  @IsString()
  clause: string;

  @IsString()
  severity: string;
}
class Fieldset {
  @IsString()
  question: string;

  @IsString()
  response: string;

  @IsString()
  ncs?: NC[];
}
class Entry {
  @IsString()
  title: string;

  @IsArray()
  fieldset: Fieldset[];

  @IsString()
  image?: string;
}
export class UpdateAuditDto {
  @IsBoolean()
  isDraft: boolean;

  @IsString()
  name: string;

  @IsString()
  number: string;

  @IsString()
  type: string;

  @IsArray()
  system: [String];

  @IsString()
  date: string;

  @IsString()
  scheduleDate: string;

  @IsString()
  organization: string;

  @IsString()
  location: string;

  @IsString()
  auditYear: string;

  @IsArray()
  auditor: string[];

  @IsArray()
  auditee: string[];

  @IsArray()
  entries: Entry[];

  @IsString()
  scope: String;

  @IsNumber()
  score: Number;

  @IsArray()
  selectedTemplates: [];
}
