import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';


@Schema({ timestamps: true })
export class Hira extends Document {
  
  @Prop({ type: String })
  jobTitle: string;

  @Prop({ type: String })
  categoryId: string;

  @Prop({ type: String })
  organizationId: string;

  @Prop({ type: String })
  locationId: string;

  @Prop({ type: String })
  entityId: string;



  @Prop({ type: String, required: false })
  section: string;

  @Prop({ type: String, required: false })
  area: string;

  @Prop({ type: String, required: false })
  riskType: string;

  @Prop({ type: String, required: false })
  condition: string;

  @Prop({ type: Array })
  assesmentTeam: [string];

  @Prop({ type: String})
  additionalAssesmentTeam: string;

  @Prop({ type: Array})
  stepIds: [string];

  @Prop({ type: String })
  createdBy: string;

  @Prop({ type: Date, default : null })
  deletedAt : Date

  @Prop({ type: String })
  workflowStatus: string;

  @Prop({ type: String })
  status: string;

  @Prop({ type: Number, default : 0 })
  currentVersion: number;

  @Prop({ type: Array })
  comments : any[];

  @Prop({ type: String })
  prefixSuffix: string;
  
  @Prop({  type: [
    {
      cycleNumber: Number,
      status: String, // IN_REVIEW, IN_APPROVAL, APPROVED
    //   hiraRegisterIds: [String],
      reviewers: [String],
      approvers: [String],
      reviewStartedBy: String,
      reviewedBy: String,
      approvedBy: String,
      approvedOn: { type: Date, default: null },
      reviewedOn: { type: Date, default: null },
      rejectedBy: String,
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
      reason: String,
      workflowHistory: [],
      comments: [],
      hiraId: String,
    },
  ], })
  workflow : any[];

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;

}

export const HiraSchema = SchemaFactory.createForClass(Hira);
