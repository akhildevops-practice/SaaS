import { IsString, IsNumber, IsDate, IsArray, IsBoolean, IsNotEmpty } from 'class-validator';

export class InspectionCreateDto {
  @IsNotEmpty()
  @IsString()
  partNumber: string;

  @IsString()
  @IsNotEmpty()
  partName: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsNumber()
  cavity: number;

  @IsNumber()
  sampleQuantity: number;

  @IsString()
  customer: string;

  @IsString()
  supplier: string;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsString()
  organizationId: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  productionDate: Date;

  @IsString()
  @IsNotEmpty()
  typeofRequest: string;

  @IsString()
  toDepartment: string;

  @IsString()
  requiredDate: string;

  @IsString()
  requestDepartment: string;

  @IsString()
  requestBy: string;

  @IsString()
  email: string;

  @IsDate()
  requestDate: Date;

  @IsArray()
  @IsNotEmpty()
  category: string[];

  @IsString()
  @IsNotEmpty()
  changePointDetails: string;

  @IsString()
  @IsNotEmpty()
  typeOfTest: string;

  @IsString()
  remarks: string;

  @IsArray()
  attachFiles: [];

  @IsString()
  overallRemarks: string;

  @IsString()
  status: string;

  @IsString()
  receivingStatus: string;

  @IsBoolean()
  editDeleteStatus: boolean;

  @IsBoolean()
  buttonStatusEdit: boolean;

  @IsBoolean()
  buttonStatusDelete: boolean;

  @IsBoolean()
  buttonStatusReceiving: boolean;

  @IsBoolean()
  buttonStatusReject: boolean;

  @IsBoolean()
  buttonStatusAllocation: boolean;

  @IsArray()
  receivingData: [];

  @IsString()
  receivingPurpose: string;

  @IsString()
  receivingRemarks: string;

  @IsString()
  clarification: string;

  @IsDate()
  targetDate: Date;

  @IsDate()
  actualDate: Date;

  @IsString()
  remarksAllocation: string;

  @IsArray()
  attachFilesTable: [];

  @IsArray()
  tableData: [];

  @IsBoolean()
  deletedAt: boolean;
}