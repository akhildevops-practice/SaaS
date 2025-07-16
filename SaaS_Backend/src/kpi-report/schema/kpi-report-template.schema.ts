import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
export type kpiReportTemplateDocument = kpiReportTemplate & Document;
@Schema({ timestamps: true })
export class kpiReportTemplate {
  @Prop({ type: String })
  kpiReportTemplateName: string;

  @Prop({ type: String })
  location: string;

  @Prop({ type: Array })
  sourceId: string[];

  @Prop({ type: Boolean, default: true })
  active: boolean;

  // @Prop({ type: String, default: "DRAFT", enum: ["DRAFT","PUBLISH"] })
  // templateStatus: string

  @Prop({ type: String })
  organization: string;

  @Prop({ type: String })
  businessUnitFilter: string;

  @Prop({ type: String })
  entityFilter: string;

  @Prop({ type: String })
  userFilter: string;

  @Prop({ type: String })
  reportFrequency: string;

  @Prop({ type: String })
  schedule: string;

  @Prop({ type: Array })
  readers: string[];

  @Prop({ type: Array })
  reportEditors: string[];

  @Prop({ type: Array })
  emailShareList: string[];

  @Prop({ type: String })
  readersLevel: string;

  @Prop({ type: String })
  createdBy: string;

  @Prop({ type: String })
  ModifiedBy: string;

  @Prop({ type: Array })
  kpiReportCategoryId: [Types.ObjectId];

  // @Prop({ type: Object })
  // dynamicFields: any;
}

export const kpiReportTemplateSchema =
  SchemaFactory.createForClass(kpiReportTemplate);
