import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Agenda extends Document {
  @Prop({ type: String })
  organizationId: string;

  @Prop({ type: String })
  name: string;
  @Prop({ type: Array })
  owner: [JSON];

  @Prop({ type: Types.ObjectId, ref: 'MeetingType', required: true })
  meetingType: Types.ObjectId;

  //   @Prop({ type: Array })
  //   owner: [string];
}

export const AgendaDocument = SchemaFactory.createForClass(Agenda);
