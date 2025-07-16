import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
export type kpiReportInstanceDocument = kpiReportInstance & Document;
@Schema({ timestamps: true })
export class kpiReportInstance {
  @Prop({ type: String })
  kpiReportInstanceName: string;

  @Prop({ type: Types.ObjectId, ref: 'kpiReportTemplate' })
  kpiReportTemplateId: string;

  @Prop({
    type: String,
  })
  reportStatus: string;

  @Prop({ type: Date })
  runDate: Date;

  @Prop({ type: String })
  organization: string;

  @Prop({ type: String })
  reportRunBy: string;

  @Prop({ type: String })
  updatedBy: string;

  @Prop({ type: String })
  year: string;
  @Prop({ type: String })
  yearFor: string;
  @Prop({ type: String })
  semiAnnual: string;
  @Prop({ type: String })
  location: string;
  @Prop({ type: String })
  entity: string;
  @Prop({ type: String })
  reportFrequency: string;
  @Prop({
    kpiReportCategoryId: { type: String },
    kpiReportCategoryName: { type: String },
    kraId: { type: String },
    kpiInfo: [
      {
        kpiId: { type: String },
        kpiTargetType: { type: String },
        kpiValue: { type: Number },
        kpiComments: { type: String },
        kpiTarget: { type: Number },
        kpiOperationalTarget: { type: Number },
        kpiUOM: { type: String },
        displayType: { type: String },
        owner: { type: Array },
        kpiDescription: { type: String },
        kpiMinimumTarget: { type: Number },
        kpiName: { type: String },
        weightage: { type: Number },
      },
    ],
    columnsArray: { type: [String] },
  })
  catInfo: any[];
}

export const kpiReportInstanceSchema =
  SchemaFactory.createForClass(kpiReportInstance);
