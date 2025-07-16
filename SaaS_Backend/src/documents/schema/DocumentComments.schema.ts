import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';

@Schema({ timestamps: true })
export class DocumentComments extends Document {
  @Prop({ type: String })
  commentBy?: string;
  @Prop({ type: String })
  commentText?: string;

  @Prop({ type: String })
  documentId?: string;
  //std to store org id
  @Prop({ type: String })
  organizationId?: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}
export const DocumentCommentsSchema =
  SchemaFactory.createForClass(DocumentComments);
