import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { HiraMitigationSchema } from './hiraMitigation.schema';

@Schema({ timestamps: true })
export class HiraConsolidatedStatus extends Document {
  @Prop({ type: String })
  jobTitle: string;

  @Prop({ type: Array, ref: 'HiraRegister' })
  hiraRegisterIds: [string];

  @Prop({ type: String })
  status: string; //IN_REVIEW, IN_APPROVAL, APPROVED

  @Prop({ type: String })
  organizationId: string;

  @Prop({ type: Array })
  reviewers: [string];

  @Prop({ type: Array })
  approvers: [string];

  @Prop({
    type: [
      {
        commentText: String,
        commentBy: String, //store first name + last name
        userId: String, //store user id who ccreated this comment
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
  })
  comments: any[];

  @Prop({
    type: [
      {
        action: String,
        by: String,
        datetime: { type: Date, default: Date.now },
      },
    ],
  })
  workflowHistory: any[];

  @Prop({
    type: [
      {
        cycleNumber: Number,
        status: String, // IN_REVIEW, IN_APPROVAL, APPROVED
        hiraRegisterIds: [String],
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
      },
    ],
  })
  workflow: any[];

  @Prop({ type: String })
  createdBy: string;

  @Prop({ type: String })
  updatedBy: string;

  @Prop({ type: String })
  reviewStartedBy: string;

  @Prop({ type: String })
  reviewedBy: string;

  @Prop({ type: String })
  approvedBy: string;

  @Prop({ type: Date, default: null })
  reviewedOn: Date;

  @Prop({ type: Date, default: null })
  approvedOn: Date;

  @Prop({ type: Boolean, default: false })
  deleted: boolean;

  @Prop({ type: Date, default: null })
  deletedAt: Date;
}

export const hiraConsolidatedStatusSchema = SchemaFactory.createForClass(
  HiraConsolidatedStatus,
);
