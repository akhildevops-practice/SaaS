import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Meeting extends Document {
  @Prop({ type: String })
  organizationId: string;

  @Prop({ type: Types.ObjectId, ref: 'ScheduleMRM', required: true })
  meetingSchedule: Types.ObjectId;

  @Prop({ type: Array })
  agenda: Object[];

  @Prop({ type: String })
  createdBy: string;

  @Prop({ type: String })
  locationId: string;
  @Prop({ type: String })
  entityId: string;
  @Prop({ type: String })
  meetingType: string;

  @Prop({ type: String })
  year: string;

  @Prop({ type: String })
  venue: string;

  @Prop({ type: String })
  meetingName: string;

  @Prop({ type: String })
  meetingdate: string;

  @Prop({ type: String })
  status: string;

  @Prop({ type: Array })
  participants: [Object];
  @Prop({ type: Array })
  externalparticipants: [string];

  @Prop({ type: String })
  minutesofMeeting: string;

  @Prop({ type: Array })
  attachments: [string];

  //   @Prop({ type: Array })
  //   decision: [Object];
}

export const MeetingDocument = SchemaFactory.createForClass(Meeting);
