import { IsArray, IsBoolean, IsString } from 'class-validator';

class Clause {
  @IsString()
  number: string;

  @IsString()
  name: string;

  @IsString()
  description: string;
}

class Location {
  @IsString()
  id: string;
}

export class CreateSystemDto {
  @IsString()
  type: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsArray()
  applicable_locations: Location[];

  // @IsArray()
  // clauses: Clause[];

  @IsString()
  organizationId: string;

  @IsBoolean()
  status: boolean;

  @IsArray()
  integratedSystems: object[];
}
