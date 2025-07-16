import {
  isArray,
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

interface objId {
  id: string;
}
export class EntityCreateDto {
  @IsNotEmpty()
  @IsString()
  realm: string;

  @IsNotEmpty()
  @IsString()
  entityName: string;

  @IsNotEmpty()
  @IsString()
  entityTypeId: any;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsArray()
  location: objId;

  // @IsNotEmpty()
  // @IsString()
  // business: string;

  // @IsNotEmpty()
  // @IsString()
  // sections: string[];
  @IsOptional()
  @IsArray()
  functionId: objId;

  @IsOptional()
  @IsArray()
  sections: objId;

  @IsNotEmpty()
  @IsString()
  entityId: string;

  @IsOptional()
  @IsArray()
  users: object[];

  @IsOptional()
  @IsArray()
  auditees: object[];

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  parentId: string;

  @IsOptional()
  @IsArray()
  pic: object[];

  @IsOptional()
  @IsNotEmpty()
  @IsObject()
  manager: any;

  @IsOptional()
  @IsArray()
  additionalAuditee: object[];

  @IsOptional()
  @IsArray()
  notification: object[];

  
  
  @IsOptional()
  @IsArray()
  hierarchyChain
  


}
