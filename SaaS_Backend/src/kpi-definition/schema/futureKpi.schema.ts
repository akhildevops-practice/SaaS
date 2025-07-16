import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type futurekpiDocument = FutureKpi & Document;

@Schema({ timestamps: true })
export class FutureKpi {
  @Prop({ type: String, required: true })
  kpiName: string;

  @Prop({ type: String })
  kpiType: string;

  @Prop({ type: Array })
  keyFields: [string];

  @Prop({ type: String, required: true })
  unitTypeId: String;

  @Prop({ type: String })
  sourceId: String;

  @Prop({ type: String })
  uom: String;

  @Prop({ type: Boolean, required: true })
  status: Boolean;

  @Prop({ type: String })
  apiEndPoint: String;

  @Prop({ type: String })
  kpiDescription: String;
  @Prop({ type: String })
  kpiTarget: String;
  @Prop({ type: String })
  kpiMinimumTarget: String;
  @Prop({ type: Array })
  owner: [JSON];
  @Prop({ type: String })
  kpiTargetType: String;

  @Prop({ type: String, required: true })
  organizationId: String;

  @Prop({ type: String, required: true })
  locationId: String;
  @Prop({ type: String })
  entityId: String;
  @Prop({ type: String })
  categoryId: String;
  @Prop({ type: String })
  frequency: String;

  @Prop({ type: Date })
  startDate: Date;
  @Prop({ type: Date })
  endDate: Date;

  @Prop({ type: String, required: true })
  createdBy: string;

  @Prop({ type: String, required: true })
  kpiId: string;
}

export const FutureKpiSchema = SchemaFactory.createForClass(FutureKpi);
