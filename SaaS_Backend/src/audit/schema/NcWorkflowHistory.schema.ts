import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NcWorkflowHistoryDocument = NcWorkflowHistory & Document;

/**
 * This schema is for the NC Workflow History. Is describes  all the properties for a NC workflow history.
 * We have seperate collections for NC Worlflow histories. Every time a new action is performed by any user we push it to history.
 */

@Schema({ timestamps: true })
export class NcWorkflowHistory {
  @Prop({ type: Types.ObjectId, ref: 'Nonconformance', required: true })
  nc: string;

  @Prop({ type: String })
  action: string;

  @Prop({ type: String, required: true })
  user: string;

  @Prop({ type: String })
  comment: string;
}

export const NcWorkflowHistorySchema =
  SchemaFactory.createForClass(NcWorkflowHistory);
