import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
@Schema({ timestamps: true })
export class ActionPoint extends Document {
  @Prop({ type: String })
  organizationId: string;

  @Prop({ type: String })
  agenda: string;

  @Prop({ type: String })
  actionPoint: string;

  @Prop({ type: String })
  decisionPoint: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: String })
  locationId: string;

  @Prop({ type: String })
  year: string;

  @Prop({ type: Date })
  dueDate: Date;

  @Prop({ type: Array })
  owner: [string];

  @Prop({ type: Array })
  files: [string];

  @Prop({ type: Types.ObjectId, ref: 'ScheduleMRM', required: true })
  mrmId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Meeting', required: true })
  meetingId: Types.ObjectId;

  @Prop({ type: Boolean, default: 'true' })
  status: boolean;

  @Prop({ type: String })
  currentYear: String;

  @Prop({ type: String })
  updatedBy: string;

  @Prop({ type: String })
  createdBy: String;
  @Prop({ type: String })
  comments: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const ActionPointDocument = SchemaFactory.createForClass(ActionPoint);
