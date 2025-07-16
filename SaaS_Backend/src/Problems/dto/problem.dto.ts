import { IsNotEmpty, IsString } from 'class-validator';

export class problemDto {
  @IsNotEmpty()
  @IsString()
  problem: string;
}
