import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import { Document, Types } from 'mongoose';
import { type } from 'os';

@Schema({ timestamps: true })
export class AuditPlanEntityWise extends Document {
  @Prop({ type: String })
  entityId: string;

  @Prop({ type: Date, default: Date.now() })
  createdAt: Date;

  @Prop({ type: Array })
  auditschedule: [boolean];

  @Prop({ type: Array })
  auditors: [string];

  @Prop({ type: String })
  organizationId: string;

  @Prop({ type: Types.ObjectId, ref: 'AuditPlan' })
  auditPlanId: string;

  @Prop({ type: Boolean, default: false })
  deleted: boolean;
}

export const AuditPlanEntityWiseSchema =
  SchemaFactory.createForClass(AuditPlanEntityWise);
