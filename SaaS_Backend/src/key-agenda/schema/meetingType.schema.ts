import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class MeetingType extends Document {
  @Prop({ type: String })
  organizationId: string;

  @Prop({ type: String })
  name: string;

  @Prop({ type: String })
  creator: string;

  @Prop({ type: Array })
  owner: [string];

  @Prop({ type: Array })
  applicableSystem: [string];

  @Prop({ type: Array })
  applicableLocation: [string];
  @Prop({ type: Array })
  participants: [Object];

  @Prop({ type: Array })
  location: [string];

  @Prop({ type: String })
  currentYear: String;

  @Prop({ type: String })
  description: String;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
  @Prop({ type: Boolean, default: false })
  deleted: boolean;
}

export const MeetingTypeDocument = SchemaFactory.createForClass(MeetingType);
