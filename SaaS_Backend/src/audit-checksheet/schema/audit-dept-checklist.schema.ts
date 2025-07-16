import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class AuditDeptChecklist extends Document {
  @Prop({ type: String })
  entityId: string;

  @Prop({ type: String })
  organizationId: string;

  @Prop({ type: String })
  auditScope: string;

  @Prop({ type: Array })
  checklist: [object];

  @Prop({ type: String })
  checklistName: string;

  @Prop({ type: String })
  createdBy: string;
}

export const AuditDeptChecklistDocument =
  SchemaFactory.createForClass(AuditDeptChecklist);