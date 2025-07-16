//import { Business } from '@prisma/client';
import { IsNotEmpty, IsString } from 'class-validator';
//import { businessType } from '@prisma/client';
export class BusinessConfig {
  entityType: entity[];
  // @IsNotEmpty()
  // @IsString()
  section: section[];
  // @IsNotEmpty()
  // @IsString()
  //functions: functions[];

  systemType: SystemType[];

  fiscalYearQuarters: string;
  fiscalYearFormat: string;

  auditYear: string;
  aiConfig?: any;
}
export class entity {
  name: string;
}

export class section {
  name: string;
}

export class SystemType {
  name: string;
}
