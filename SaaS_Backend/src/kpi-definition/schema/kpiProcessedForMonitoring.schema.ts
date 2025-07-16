import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type KpiProcessedForMonitoringDocument = KpiProcessedForMonitoring &
  Document;

@Schema({ timestamps: true })
export class KpiProcessedForMonitoring {
  @Prop({ type: String, required: true })
  kpiId: string;

  @Prop({ type: String })
  entityId: string;

  @Prop({ type: String })
  capaId: string;
  @Prop({ type: String })
  startDate: string;
  @Prop({ type: String })
  endDate: string;

  @Prop({ type: Date })
  reportFor: Date;

  @Prop({ type: String, required: true })
  organizationId: String;
}

export const KpiProcessedForMonitoringSchema = SchemaFactory.createForClass(
  KpiProcessedForMonitoring,
);
