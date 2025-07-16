import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class HiraReviewHistory extends Document {
  @Prop({ type: String })
  jobTitle: string;

  @Prop({ type: Array, ref: 'HiraRegister' })
  hiraRegisterIds: [string];

  @Prop({ type: String })
  organizationId: string;

  @Prop({
    type: [
      {
        commentText: String,
        commentBy: String, //store first name + last name
        userId: String, //store user id who ccreated this comment
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
  })
  comments: any[];

  @Prop({ type: String })
  createdBy: string;

  @Prop({ type: String })
  updatedBy: string;

  @Prop({ type: String })
  reviewedBy: string;

  @Prop({ type: Boolean, default: false })
  deleted: boolean;

  @Prop({ type: Date, default: null })
  deletedAt: Date;
}

export const HiraReviewHistorySchema =
  SchemaFactory.createForClass(HiraReviewHistory);
