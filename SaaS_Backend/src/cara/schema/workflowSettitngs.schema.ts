import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class WorkflowSettings extends Document {
  @Prop({ type: String })
  organizationId: string;
  @Prop({ type: String })
  createdBy: string;
  @Prop({ type: String })
  updatedBy: string;
  //added for executive approval;
  @Prop({ type: Boolean })
  executiveApprovalRequired: boolean;
  @Prop({ type: Object })
  executive: JSON;
}

export const Workflow = SchemaFactory.createForClass(WorkflowSettings);
