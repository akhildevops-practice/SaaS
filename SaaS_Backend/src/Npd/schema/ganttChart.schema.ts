import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Define the interface representing the structure of the
// Create the Mongoose schema
@Schema({ timestamps: true })
export class NpdGanttChart extends Document {
  @Prop({ type: String })
  TaskId: string;

  @Prop({ type: String })
  TaskName: string;

  @Prop({ type: Date })
  StartDate: Date;

  @Prop({ type: Date })
  EndDate: Date;

  @Prop({ type: String })
  TimeLog: string;

  @Prop({ type: String })
  Work: string;

  @Prop({ type: String })
  Progress: string;

  @Prop({ type: String })
  Status: string;

  @Prop({ type: String })
  ParentId: string;

  @Prop({ type: String })
  Priority: string;

  @Prop({ type: String })
  Component: string;

  @Prop({ type: String })
  type: string;

  @Prop({ type: Date })
  BaselineStartDate: Date;

  @Prop({ type: Date })
  BaselineEndDate: Date;

  @Prop({ type: String })
  isSelection: string;

  @Prop({ type: Array })
  evidence: [];

  @Prop({ type: Array })
  Assignee: [];

  @Prop({ type: Array })
  remarks: [];

  @Prop({ type: String })
  version: string;

  @Prop({ type: String })
  npdId: string;

  @Prop({ type: String })
  dptId: string;

  @Prop({ type: String })
  category: string;

  @Prop({ type: String })
  stakeHolderId: string;

  @Prop({ type: String })
  stakeHolderName: string;

  @Prop({ type: Array })
  picId: [];

  @Prop({ type: Array })
  pm: [];

  @Prop({ type: Array })
  progressData: [];

  @Prop({ type: String })
  organizationId: string;

  @Prop({ type: Date, default: Date.now() })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Boolean, default: false })
  isMileStone: boolean;

  @Prop({ type: Boolean, default: false })
  paStatus: boolean;

  @Prop({ type: Boolean, default: false })
  planFreeze: boolean;

  @Prop({ type: Boolean, default: false })
  isDraggable: boolean;

  @Prop({ type: Boolean, default: false })
  isParent: boolean;

  @Prop({ type: Boolean, default: false })
  isExpand: boolean;

  @Prop({ type: Boolean, default: false })
  isInformToPic: boolean;

  @Prop({ type: Boolean, default: false })
  deletedAt: boolean;
}

// Create the Mongoose schema factory
export const NpdGanttChartSchema = SchemaFactory.createForClass(NpdGanttChart);
