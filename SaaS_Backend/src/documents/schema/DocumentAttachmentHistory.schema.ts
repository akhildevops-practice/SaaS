import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';

@Schema({ timestamps: true })
export class DocumentAttachmentHistory extends Document {
  @Prop({ type: String })
  updatedBy?: string;
  @Prop({ type: String })
  updatedLink?: string;
  @Prop({ type: Date })
  updatedAt?: Date;

  @Prop({ type: String })
  documentId?: string;
  //std to store org id
  @Prop({ type: String })
  organizationId?: string;
}
export const DocumentAttachmentHistorySchema = SchemaFactory.createForClass(
  DocumentAttachmentHistory,
);
