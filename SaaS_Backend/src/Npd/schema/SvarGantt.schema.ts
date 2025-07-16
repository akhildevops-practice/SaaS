import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Define the interface representing the structure of the
// Create the Mongoose schema
@Schema({ timestamps: true })
export class SvarGantt extends Document {
  @Prop({ type: String })
  id: string;

  @Prop({ type: String })
  text: string;

  @Prop({ type: String })
  status: string;

  @Prop({ type: Date })
  start: Date;

  @Prop({ type: Date })
  end: Date;
  @Prop({ type: Date })
  baseStart: Date;

  @Prop({ type: Date })
  baseEnd: Date;
  @Prop({ type: Number })
  duration: number;
  @Prop({ type: Number })
  progress: number;
  @Prop({ type: String })
  type: string;
  @Prop({ type: String })
  npdId: string;
  @Prop({ type: Boolean })
  lazy: boolean;
  @Prop({ type: Boolean })
  open: boolean;
  //newly added fields to store pic,progress info,
  @Prop({ type: Array })
  picId: [];
  @Prop({ type: String })
  dptId: string;
  @Prop({ type: Array })
  progressData: [];
  @Prop({ type: Boolean, default: false })
  planFreeze: boolean;

  @Prop({ type: Array })
  assignee: [];
  @Prop({ type: Array })
  remarks: [];

  @Prop({ type: Boolean, default: false })
  isInformToPic: boolean;

  @Prop({ type: String })
  organizationId: string;

  @Prop({ type: String })
  parent: string;
  @Prop({ type: String })
  parentName: string;

  @Prop({ type: String })
  createdBy: string;

  @Prop({ type: Date, default: () => Date.now() })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Boolean, default: false })
  deletedAt: boolean;
}

// Create the Mongoose schema factory
export const SvarGanttChartSchema = SchemaFactory.createForClass(SvarGantt);
