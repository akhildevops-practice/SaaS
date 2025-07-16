import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class AuditSettings extends Document {
  @Prop({ type: String })
  auditType: string;

  @Prop({ type: String })
  auditTypeId: string;

  @Prop({ type: String })
  scope: string;

  @Prop({ type: String })
  responsibility: string;

  @Prop({ type: String })
  planType: string;

  @Prop({ type: Boolean })
  auditorCheck: boolean;

  @Prop({ type: Boolean })
  allowConsecutive: boolean;

  @Prop({ type: Boolean })
  auditorsFromSameUnit: boolean;

  @Prop({ type: Array })
  system: [];

  @Prop({ type: Boolean })
  auditorsFromSameDept: boolean;

  @Prop({ type: Boolean })
  inductionApproval: boolean;

  @Prop({ type: Boolean, default: false })
  useFunctionsForPlanning: boolean;

  @Prop({ type: String })
  Description: string;

  @Prop({ type: String })
  resolutionWorkFlow: string;

  @Prop({ type: String })
  organizationId: string;

  @Prop({ type: Number })
  AutoAcceptNC: number;

  @Prop({ type: Number })
  ClosureRemindertoDeptHead: number;

  @Prop({ type: Number })
  ClosureRemindertoMCOE: number;

  @Prop({ type: String })
  VerificationOwner: string;

  @Prop({ type: Number })
  AuditeeReminder: number;

  @Prop({ type: Number })
  EscalationtoDepartmentHead: number;

  @Prop({ type: Number })
  EscalationtoMCOE: number;

  @Prop({ type: String })
  whoCanPlan: string;

  @Prop({ type: String })
  whoCanSchedule: string;

  @Prop({ type: Array })
  planningUnit?: string[];

  @Prop({ type: Object })
  planningEntity?: object;

  @Prop({ type: Boolean, default: false })
  deleted: boolean;

  @Prop({ type: Boolean, default: false })
  multipleEntityAudit: boolean;

  @Prop({ type: Array })
  schedulingUnit?: string[];

  @Prop({ type: Object })
  schedulingEntity?: object;

  @Prop({ type: Number })
  maxSections: number;

  @Prop({ type: Number })
  auditTimeFrame: number;

  @Prop({ type: Number })
  noOfSopQuestions: number;

  @Prop({ type: Number })
  noOfFindingsQuestions: number;

  @Prop({ type: Number })
  noOfOperationQuestions: number;

  @Prop({ type: Number })
  noOfHiraQuestions: number;

  @Prop({ type: Number })
  noOfAspImpQuestions: number;
}

export const AuditSettingsSchema = SchemaFactory.createForClass(AuditSettings);
