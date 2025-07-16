import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type kpiMonitoringDocument = KpiMonitoring & Document;

@Schema({ timestamps: true })
export class KpiMonitoring {
  @Prop({ type: String, required: true })
  kpiId: string;

  @Prop({ type: String })
  deviationType: string;
  @Prop({ type: Number })
  deviationOccurencesToAllow: number;
  @Prop({ type: String })
  valueToMonitor: String;

  @Prop({ type: String })
  valueFrom: String;

  @Prop({ type: String })
  uom: String;

  @Prop({ type: String })
  createdBy: String;

  //   @Prop({ type: Boolean, required: true })
  //   status: Boolean;

  @Prop({ type: String, required: true })
  organizationId: String;
}

export const KpiMonitoringSchema = SchemaFactory.createForClass(KpiMonitoring);
