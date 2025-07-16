import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class HiraChangesTrack extends Document {
  @Prop({ type: String })
  jobTitle: string;

  @Prop({ type: Array, ref: 'HiraRegister' })
  hiraRegisterIds: [string];

  @Prop({ type: String })
  organizationId: string;

  @Prop({ type: String })
  status: string;

  @Prop({ type: String })
  createdBy: string;

  @Prop({ type: String })
  updatedBy: string;

  @Prop({ type: Boolean, default: false })
  deleted: boolean;

  @Prop({ type: Date, default: null })
  deletedAt: Date;
}

export const HiraChangesTrackSchema =
  SchemaFactory.createForClass(HiraChangesTrack);
