import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

interface objId {
  id: string;
}
export class UserMaster {
  @IsNotEmpty()
  @IsString()
  realm?: string;

  @IsNotEmpty()
  @IsString()
  userType?: string;

  @IsNotEmpty()
  @IsString()
  status?: boolean;

  @IsNotEmpty()
  @IsString()
  username?: string;

  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsArray()
  location?: objId;

  // @IsNotEmpty()
  // @IsString()
  // business?: string;

  // @IsNotEmpty()
  @IsOptional()
  @IsArray()
  entity?: objId;

  // @IsNotEmpty()
  // @IsString()
  // section?: string;

  @IsNotEmpty()
  @IsString()
  roles?: string[];

  @IsNotEmpty()
  @IsString()
  kcId?: string;

  @IsOptional()
  functionId: any;

  @IsOptional()
  signature: any;

  @IsOptional()
  roleName: any;

  @IsOptional()
  additionalUnits: string[];
}
