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
// class Field {
//   @IsString()
//   question: string;

//   @IsString()
//   response: string;

//   @IsString()
//   ncs?: NC;

//   @IsString()
//   image: string;
// }
// class Section {
//   @IsString()
//   title: string;

//   @IsArray()
//   fieldset: Field[];
// }
export class CreateAuditDto {
  @IsBoolean()
  isDraft: boolean;

  @IsString()
  auditName: string;

  @IsString()
  auditNumber: string;

  @IsString()
  auditType: string; // system type id

  @IsString()
  auditTypeId: string;

  @IsString()
  auditedEntity: string;

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
  auditors: any[];

  @IsArray()
  auditees: any[];

  @IsArray()
  sections: any[];

  @IsNumber()
  totalScore: Number;

  @IsBoolean()
  status: boolean;

  @IsArray()
  auditedClauses: string[];

  @IsString()
  auditedDocuments: string[];

  @IsString()
  comment: string;

  @IsString()
  auditScheduleId: string;

  @IsArray()
  urls: string[];

  @IsArray()
  selectedTemplates: [];
}
