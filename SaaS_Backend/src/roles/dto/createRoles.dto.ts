import { IsNotEmpty, IsString, IsArray } from 'class-validator';

export class createRoles {
  @IsNotEmpty()
  @IsString()
  orgId;

  @IsNotEmpty()
  @IsString()
  unitId;

  // @IsNotEmpty()
  // @IsString()
  @IsArray()
  roleId;

  @IsArray()
  users;
}
