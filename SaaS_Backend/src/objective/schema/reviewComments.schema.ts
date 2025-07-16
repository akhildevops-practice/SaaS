import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ReviewComments extends Document {
  @Prop({ type: String })
  ReviewedBy: string;

  @Prop({ type: Date, default: Date.now() })
  ReviewDate: Date;

  @Prop({ type: String })
  ReviewComments: string;

  @Prop({ type: Types.ObjectId, ref: 'objectiveMaster' })
  ObjectiveId: string;
}

export const ReviewCommentsSchema =
  SchemaFactory.createForClass(ReviewComments);
