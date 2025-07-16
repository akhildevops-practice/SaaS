import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateOrgDto {
  @IsNotEmpty()
  @IsString()
  realm: string;
  //check for slash
  @IsNotEmpty()
  @IsString()
  instanceUrl: string;

  @IsNotEmpty()
  @IsString()
  principalGeography: string;

  @IsString()
  orgAdminTitle: string;

  @IsString()
  applicationAdminTitle: string;

  @IsBoolean()
  digitalSignature: boolean;
}
