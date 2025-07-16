import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class HiraOwnerComments extends Document {
  @Prop({ type: Date, default: Date.now()})
  CommentDate: Date;

  @Prop({ type: String })
  ReviewComments: string;

  @Prop({ type: Types.ObjectId , ref: "risk" })
  risk: string;

 
}

export const HiraOwnerCommentsSchema = SchemaFactory.createForClass(HiraOwnerComments);