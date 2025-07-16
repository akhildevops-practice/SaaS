import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import mongoose, { Document, Types } from 'mongoose';
import { type } from 'os';

@Schema({ timestamps: true })
export class AuditPlanUnitWise extends Document {
  @Prop({ type: String })
  auditPlanEntitywiseId: string;

  @Prop({ type: Date, default: Date.now() })
  createdAt: Date;
  
  @Prop({
    type: {
      id: {
        type: String,
      },
      accepted: { type: String },
    },
  })
  unitHead;

  @Prop({
    type: {
      id: {
        type: String,
      },
      accepted: { type: String },
    },
  })
  imsCoordinator;

  @Prop({
    id: {
      type: String,
    },
    accepted: { type: String },
  })
  otherUsers: any[];

  @Prop({
    id: {
      type: String,
    },
    accepted: { type: String },
  })
  auditors: any[];

  @Prop({
    commentString: {
      type: String,
    },
    createdAt: { type: Date, default: Date.now() },
    createdBy: { type: String },
  })
  comments: any[];

  @Prop({ type: Date })
  fromDate: Date;

  @Prop({ type: Date })
  toDate: Date;

  @Prop({ type: String })
  plannedBy: String;

  @Prop({ type: String })
  organizationId: string;

  @Prop({ type: String })
  unitId: string;

  @Prop({ type: String })
  auditPlanId: string;

  @Prop({ type: Boolean, default : false })
  isDraft: Boolean;

  @Prop({ type: String })
  teamLeadId: string; 

  @Prop({ type: String })
  auditPeriod: string; 
}

export const AuditPlanUnitWiseSchema =
  SchemaFactory.createForClass(AuditPlanUnitWise);
