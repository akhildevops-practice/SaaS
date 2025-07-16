// Import necessary modules
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Define the interface representing the structure of the
// Create the Mongoose schema
@Schema({ timestamps: true })
export class Inspection extends Document {
  @Prop({ type: String,required:true })
  partNumber: string;

  @Prop({ type: Number })
  cavity: number;

  @Prop({ type: Number })
  sampleQuantity: number;

  @Prop({ type: String })
  customer: string;

  @Prop({ type: String })
  supplier: string;

  @Prop({ type: String })
  reason: string;

  @Prop({ type: String })
  organizationId: string;

  @Prop({ type: Date, default: Date.now() })
  createdAt: Date;

  @Prop({ type: String })
  partName: string;

  @Prop({ type: String })
  model: string;

  @Prop({ type: Date })
  productionDate: Date;

  @Prop({ type: String })
  typeofRequest: string;

  @Prop({ type: String })
  toDepartment: string;

  @Prop({ type: String })
  requiredDate: string;

  @Prop({ type: String })
  requestDepartment: string;

  @Prop({ type: String })
  requestBy: string;

  @Prop({ type: String })
  email: string;

  @Prop({ type: Date })
  requestDate: Date;

  @Prop({ type: Array })
  category: string[];

  @Prop({ type: String })
  changePointDetails: string;

  @Prop({ type: String })
  typeOfTest: string;

  @Prop({ type: String })
  remarks: string;

  @Prop({ type: Array })
  attachFiles: [];

  @Prop({ type: String })
  overallRemarks: string;

  @Prop({ type: String })
  status: string;

  @Prop({ type: String })
  receivingStatus: string;

  @Prop({ type: Boolean })
  editDeleteStatus: boolean;

  @Prop({ type: Boolean })
  buttonStatusEdit: boolean;

  @Prop({ type: Boolean })
  buttonStatusDelete: boolean;

  @Prop({ type: Boolean })
  buttonStatusReceiving: boolean;

  @Prop({ type: Boolean })
  buttonStatusReject: boolean;

  @Prop({ type: Boolean })
  buttonStatusAllocation: boolean;

  @Prop({ type: Array })
  receivingData: [];

  @Prop({ type: String })
  receivingPurpose: string;

  @Prop({ type: String })
  receivingRemarks: string;

  @Prop({ type: String })
  clarification: string;

  @Prop({ type: Date })
  targetDate: Date;

  @Prop({ type: Date })
  actualDate: Date;

  @Prop()
  remarksAllocation: string;

  @Prop({ type: Array })
  attachFilesTable: [];

  @Prop({ type: Array })
  tableData: [];

  @Prop({ type: Boolean,default:false })
  deletedAt:boolean
}

// Create the Mongoose schema factory
export const InspectionSchema = SchemaFactory.createForClass(Inspection);
