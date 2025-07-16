import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class HiraReviewComments extends Document {
  @Prop({ type: String })
  comment: string;

  @Prop({ type: Types.ObjectId, ref: 'Riskschema' })
  riskId: string;

  @Prop({ type: String })
  userId: string;

  @Prop({ type: Date, default: Date.now() })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now() })
  updatedAt: Date;
}

export const HiraReviewCommentsSchema =
  SchemaFactory.createForClass(HiraReviewComments);
