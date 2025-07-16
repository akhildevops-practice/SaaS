import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, now, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ActionItems extends Document {
  @Prop({ type: String })
  title: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: Boolean })
  status: boolean;

  @Prop({ type: Array })
  owner: [string];

  @Prop({ type: String })
  startDate: string;

  @Prop({ type: String })
  endDate: string;

  @Prop({ type: String })
  assignedBy: string;
  @Prop({ type: String })
  source: string;
  @Prop({ type: String })
  transactionLink: string;
  @Prop({ type: String })
  year: string;

  @Prop({ type: String })
  locationId: string;
  @Prop({ type: String })
  entityId: string;
  @Prop({ type: String })
  targetDate: string;
  @Prop({ type: String })
  activityDate: string;

  @Prop({ type: String })
  comments: string;

  @Prop({ type: Boolean, default: false })
  deleted: boolean;
  @Prop({ type: Date })
  deletedAt: Date;

  @Prop({ type: JSON })
  additionalInfo: Object; //field to store module specific info to pass while creating actionItem

  @Prop({ type: String })
  referenceId: string; //id for which action item is created(findings,meeting agenda,cip )
  @Prop({ type: String })
  organizationId: string;
}
export const actionitemsSchema = SchemaFactory.createForClass(ActionItems);
