import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
export class createReviewComments {
  @IsNotEmpty()
  @IsString()
  ReviewComments;

  @IsNotEmpty()
  @IsString()
  ReviewedBy;

  @IsNotEmpty()
  @IsString()
  ObjectiveId;
}
