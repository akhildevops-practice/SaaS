import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class AuditChecksheetTemplate extends Document {
  @Prop({ type: String })
  organizationId: string;

  @Prop({ type: String })
  title: string;

  @Prop({ type: String })
  formHeaderTitle: string;

  @Prop({ type: Array })
  formHeader: [object];

  @Prop({ type: Array })
  tableFields: [object];

  @Prop({ type: String })
  lastUpdatedBy: string;

  @Prop({ type: String })
  workflowId: string;

  @Prop({ type: Number })
  formLayout: number;
}

export const AuditChecksheetTemplateDocument = SchemaFactory.createForClass(
  AuditChecksheetTemplate,
);
