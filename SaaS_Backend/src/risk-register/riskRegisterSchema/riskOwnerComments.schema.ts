import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class RiskOwnerComments extends Document {
  @Prop({ type: Date, default: Date.now()})
  CommentDate: Date;

  @Prop({ type: String })
  ReviewComments: string;

  @Prop({ type: Types.ObjectId , ref: "risk" })
  risk: string;

 
}

export const RiskOwnerCommentsSchema = SchemaFactory.createForClass(RiskOwnerComments);