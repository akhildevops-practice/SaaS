import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';

@Schema({ timestamps: true })
export class AdditionalDocumentAdmins extends Document {
  @Prop({ type: String })
  type?: string;
  @Prop({ type: String })
  firstName?: string;
  @Prop({ type: String })
  lastName?: string;
  @Prop({ type: String })
  email?: string;
  @Prop({ type: String })
  userId?: string;
  @Prop({ type: String })
  documentId?: string;
  //std to store org id
  @Prop({ type: String })
  organizationId?: string;
}
export const AdditionalDocumentAdminsSchema = SchemaFactory.createForClass(
  AdditionalDocumentAdmins,
);
