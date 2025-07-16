import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { json } from 'stream/consumers';
@Schema({ timestamps: true })
export class ScheduleMRM extends Document {
  @Prop({ type: String })
  organizationId: string;

  @Prop({ type: String })
  momPlanYear: string;

  @Prop({ type: String })
  unitId: string;
  @Prop({ type: String })
  entityId: string;

  @Prop({ type: Array })
  systemId: [string];

  @Prop({ type: String })
  period: string;
  @Prop({ type: Array })
  date: [Object];

  @Prop({ type: String })
  meetingName: string;

  @Prop({ type: String })
  meetingType: string;
  @Prop({ type: Date })
  meetingdate: Date;

  @Prop({ type: Array })
  keyAgendaId: [string];

  @Prop({ type: String })
  venue: string;

  @Prop({ type: Array })
  attendees: [Object];

  @Prop({ type: Array })
  externalattendees: [String];

  @Prop({ type: Array })
  files: [string];

  @Prop({ type: String })
  organizer: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: Array })
  decision: [string];

  @Prop({ type: String })
  notes: string;

  @Prop({ type: String })
  currentYear: String;

  @Prop({ type: String })
  updatedBy: string;

  @Prop({ type: String })
  createdBy: String;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;

  @Prop({ type: String })
  status: string;
  @Prop({ type: Boolean, default: false })
  deleted: boolean;
}

export const ScheduleMRMDocument = SchemaFactory.createForClass(ScheduleMRM);
