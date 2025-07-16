import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class AuditSchedule extends Document {
  @Prop({ type: String })
  auditScheduleName: string;

  @Prop({ type: Array })
  auditPeriod: [Date];

  @Prop({ type: Array })
  period: [];

  @Prop({ type: Array })
  selectedFunction: [];

  @Prop({ type: String })
  auditYear: string;

  @Prop({ type: String })
  auditScheduleNumber: string;

  @Prop({ type: String })
  status: string;

  @Prop({ type: Date, default: Date.now() })
  createdAt: Date;

  @Prop({ type: String })
  createdBy: string;

  @Prop({ type: Boolean, default: false })
  useFunctionsForPlanning: boolean;

  @Prop({ type: Date, default: Date.now() })
  updatedAt: Date;

  @Prop({ type: String })
  organizationId: String;

  @Prop({ type: String })
  auditType: String;

  @Prop({ type: String })
  roleId: String;

  @Prop({ type: String })
  entityTypeId: String;

  @Prop({ type: String })
  auditPlanId: String;

  @Prop({ type: String })
  locationId: String;

  @Prop({ type: String })
  systemTypeId: String;

  @Prop({ type: String })
  auditNumber: String;

  @Prop({ type: Types.ObjectId, ref: 'AuditTemplate' })
  auditTemplateId: String;

  @Prop({ type: Array, ref: 'AuditTemplate' })
  auditTemplates: [String];

  @Prop({ type: Array, ref: 'System' })
  systemMasterId: [string];

  @Prop({ type: String })
  prefixSuffix: String;

  @Prop({ type: Boolean, default: false })
  deleted: Boolean;

  @Prop({ type: Boolean, default: true })
  isDraft: Boolean;

  @Prop({ type: String })
  run_id: String;

  @Prop({ type: Boolean, default: false })
  isAiGenerated: Boolean;

  @Prop({ type: Array })
  clauses: [];

  @Prop({ type: Array })
  sop_refs: [];

  @Prop({ type: Array })
  hira_refs: [];

  @Prop({ type: Array })
  capa_refs: [];

  @Prop({ type: Array })
  clause_refs: [];

  @Prop({ type: Object })
  completion_status: any;

  @Prop({ type: String })
  auditScope: String;
}

export const AuditScheduleSchema = SchemaFactory.createForClass(AuditSchedule);
