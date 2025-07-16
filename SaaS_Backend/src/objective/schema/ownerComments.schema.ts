import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class OwnerComments extends Document {
  @Prop({ type: Date, default: Date.now()})
  CommentDate: Date;

  @Prop({ type: String })
  ReviewComments: string;

  @Prop({ type: Types.ObjectId , ref: "objectiveMaster" })
  ObjectiveId: string;

 
}

export const OwnerCommentsSchema = SchemaFactory.createForClass(OwnerComments);