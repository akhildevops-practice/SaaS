import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Define the interface representing the structure of the
// Create the Mongoose schema
@Schema({ timestamps: true })
export class NpdRegister extends Document {
  @Prop({ type: String })
  projectType: string;

  @Prop({ type: Object })
  projectTypeData: {};

  @Prop({ type: String })
  projectName: string;

  @Prop({ type: Array })
  customer: [];

  @Prop({ type: Array })
  supplier: [];

  @Prop({ type: Date })
  sopDate: Date;
  //new field added for customer
  @Prop({ type: Date })
  customerSopDate: Date;

  @Prop({ type: String })
  sopQuantity: string;

  @Prop({ type: String })
  escNumber: string;

  @Prop({ type: String })
  escRank: string;

  @Prop({ type: String })
  justification: string;
  //model moved from part details to header info
  @Prop({ type: String })
  model: string;

  @Prop({ type: String })
  meetingDate: string;

  @Prop({ type: Array })
  partDetails: [];

  @Prop({ type: Array })
  departmentData: [];

  @Prop({ type: Array })
  attachFiles: [];

  @Prop({ type: Array })
  projectAdmins: [];

  @Prop({ type: String })
  organizationId: string;
  @Prop({ type: String })
  serialNumber: string;
  @Prop({ type: String })
  createdBy: string;

  @Prop({ type: String })
  updatedBy: string;

  @Prop({ type: String })
  status: string;

  @Prop({ type: Boolean, default: false })
  isDraft: boolean;
  // @Prop({ type: Boolean, default: false })
  // revisedStatus: boolean;
  @Prop({ type: Date, default: Date.now() })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Boolean, default: false })
  deletedAt: boolean;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Date })
  inActiveDate: Date;

  @Prop({ type: String })
  inActivatedBy: string;

  @Prop({ type: String })
  inActivateReason: string;

  @Prop({ type: String })
  businessKickoffMeeting: string;

  @Prop({ type: Array })
  evidence: [];
  
}

// Create the Mongoose schema factory
export const NpdRegisterSchema = SchemaFactory.createForClass(NpdRegister);
