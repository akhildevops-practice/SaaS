import {
  IsAlpha,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  isString,
  IsString,
} from 'class-validator';

export class CreateDoctypeDto {
  @IsNotEmpty()
  @IsString()
  documentTypeName?: string;

  @IsNotEmpty()
  @IsString()
  documentNumbering: string;

  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  reviewFrequency?: number;

  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  revisionRemind?: number;

  @IsNotEmpty()
  @IsString({ each: true })
  prefix: string[];

  @IsOptional()
  @IsNotEmpty()
  @IsString({ each: true })
  suffix: string[];

  @IsOptional()
  @IsArray()
  applicable_locations?: any;

  @IsOptional()
  @IsArray()
  applicable_systems: string[];

  @IsOptional()
  @IsNotEmpty()
  docReadAccess: any;

  @IsOptional()
  @IsArray()
  docReadAccessIds?: string[];

  @IsOptional()
  @IsNotEmpty()
  docCreateAccess: any;

  @IsOptional()
  @IsArray()
  docCreateAccessIds?: string[];

  @IsOptional()
  @IsNotEmpty()
  whoCanCreate: any;

  @IsOptional()
  @IsArray()
  whoCanCreateIds: any;

  @IsOptional()
  @IsString()
  currentVersion: string;

  @IsString()
  userId: string;

  @IsString()
  organizationId: string;

  @IsBoolean()
  default: boolean;
}

// export class creator {
//     id: string
//     email: string
//     firstName: string
//     lastName: string

// }

// export class readAccessRestricted {
//     type: string
//     usersWithAccess: string[]

// }
