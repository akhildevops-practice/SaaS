import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class AuditChecksheets extends Document {
  @Prop({ type: String })
  title: string;

  @Prop({ type: String })
  organizationId: string;

  @Prop({ type: String })
  auditChecksheetTemplateId: string;

  @Prop({ type: String })
  formHeaderTitle: string;

  @Prop({ type: Array })
  formHeaderContents: [object];

  @Prop({ type: String })
  tableHeaderTitle: string;

  @Prop({ type: Array })
  tableHeader: [object];

  @Prop({ type: Array })
  tableContentValues: [object];

  @Prop({ type: Array })
  tableFieldsContents: [object];

  @Prop({ type: String })
  createdBy: string;

  @Prop({ type: Number })
  formLayout: number;

  @Prop({ type: String })
  type: string;

  @Prop({ type: Object })
  workflowDetails: object;
  @Prop({ type: Array })
  signatureDetails: [object];
  @Prop({ type: String })
  status: string;
}

export const AuditChecksheetsDocument =
  SchemaFactory.createForClass(AuditChecksheets);
