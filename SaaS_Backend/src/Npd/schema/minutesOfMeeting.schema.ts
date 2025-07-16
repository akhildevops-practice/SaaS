import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Define the interface representing the structure of the
// Create the Mongoose schema
@Schema({ timestamps: true })
export class MinutesOfMeeting extends Document {
  @Prop({ type: String })
  meetingName: '';

  @Prop({ type: Object })
  meetingOwner: {};

  @Prop({ type: String })
  meetingDateForm: '';

  @Prop({ type: String })
  meetingDateTo: '';

  @Prop({ type: Array })
  attendees: [];

  @Prop({ type: Array })
  excuses: [];

  @Prop({ type: String })
  description: '';

  @Prop({ type: Array })
  npdIds: [];

  //   @Prop({ type: Array })
  //   npdIdData: [];

  //   @Prop({ type: Array })
  //   discussionItems: [];

  @Prop({ type: Array })
  attachments: [];

  @Prop({ type: Array })
  presentDpt: [];

  @Prop({ type: Array })
  absentDpt: [];

  @Prop({ type: String })
  status: '';

  @Prop({ type: String })
  momStatus: '';

  @Prop({ type: Date, default: Date.now() })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Boolean, default: false })
  deletedAt: boolean;

  @Prop({ type: String })
  createdBy: string;

  @Prop({ type: Date })
  createdOn: Date;
}

// Create the Mongoose schema factory
export const MinutesOfMeetingSchema =
  SchemaFactory.createForClass(MinutesOfMeeting);
