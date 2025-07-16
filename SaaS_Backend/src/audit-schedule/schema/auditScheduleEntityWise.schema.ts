import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
// import { Timestamp } from 'rxjs';

@Schema({ timestamps: true })
export class AuditScheduleEntityWise extends Document {
  @Prop({ type: String })
  entityId: string;

  @Prop({ type: Date })
  time:Date;

  @Prop({ type: Array })
  endTime: [Date];

  @Prop({ type: Number })
  duration: number;

  @Prop({ type: Array })
  auditor: [string];

  @Prop({ type: Array })
  auditee: [string];

  @Prop({ type: String })
  comments: string;

  @Prop({ type: Types.ObjectId, ref: 'AuditSchedule' })
  auditScheduleId: [string];

  @Prop({ type: String })
  auditTemplateId: string;

  @Prop({ type: Array, ref: 'AuditTemplate' })
  auditTemplates: [String];

  @Prop({ type: Array })
  areas: [string];

  @Prop({ type: String })
  createdBy: string;

  @Prop({ type: Boolean, default: false })
  deleted: Boolean;
}

export const AuditScheduleEntityWiseSchema = SchemaFactory.createForClass(
  AuditScheduleEntityWise,
);
