import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

//export type AuditPlanDocument = AuditPlan & Document;

@Schema({ timestamps: true })
export class AuditPlan extends Document {
  @Prop({ type: String })
  auditName: string;

  @Prop({ type: String })
  auditYear: string;

  @Prop({ type: String })
  status: string;

  @Prop({ type: String })
  version: string;

  @Prop({ type: Date })
  publishedOnDate: Date;

  @Prop({ type: Date, default: Date.now() })
  createdAt: Date;

  @Prop({ type: String })
  createdBy: string;

  @Prop({ type: Date, default: Date.now() })
  updatedAt: Date;

  @Prop({ type: String })
  updatedBy: string;

  @Prop({ type: String })
  systemTypeId: string;

  @Prop({ type: String })
  entityTypeId: string;

  @Prop({ type: Array })
  auditors: [string];

  @Prop({ type: String })
  comments: string;

  @Prop({ type: String })
  location: string;

  @Prop({ type: String })
  organizationId: string;

  @Prop({ type: Array })
  systemMasterId: [string];

  @Prop({ type: String })
  roleId: string;

  @Prop({ type: String })
  auditType: string;

  @Prop({ type: String })
  prefixSuffix: string;

  @Prop({ type: Array })
  removedId: [string];

  @Prop({ type: Boolean, default: false })
  deleted: Boolean;

  @Prop({ type: Boolean, default: true })
  isDraft: Boolean;

}

export const AuditPlanSchema = SchemaFactory.createForClass(AuditPlan);
