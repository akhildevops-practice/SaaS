import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
export type kpiReportCategoryDocument = kpiReportCategory & Document;
@Schema({ timestamps: true })
export class kpiReportCategory {
  @Prop({ type: String })
  kpiReportCategoryName: string;

  @Prop({ type: Types.ObjectId, ref: 'kpiReportTemplate' })
  kpiReportTemplateId: string;

  @Prop({ type: Types.ObjectId, ref: 'kra' })
  kraId: string;

  @Prop({
    id: { type: String },
    kpiId: { type: String },
    kpiName: { type: String },
    kpiDescription: { type: String },
    kpiUOM: { type: String },
    kpiTargetType: { type: String },
    // kpiTarget:{type:String},
    kpiValue: { type: Number },
    kpiComments: { type: String },
    kpiTarget: { type: Number },
    kpiOperationalTarget: { type: Number },
    minimumTarget: { type: Number },
    weightage: { type: Number },
  })
  kpiInfo: any[];

  @Prop({ type: Array })
  columnsArray: { type: String[] };

  // @Prop({ type: Object })
  // dynamicFields: any;
}

export const kpiReportCategorySchema =
  SchemaFactory.createForClass(kpiReportCategory);
