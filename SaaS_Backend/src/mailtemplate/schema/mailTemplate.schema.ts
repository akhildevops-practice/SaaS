import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
export type mailTemplateDocument = MailTemplate & Document;
@Schema({ timestamps: true })
export class MailTemplate {
  @Prop({ type: String })
  mailEvent: string;

  @Prop({ type: String })
  lastModifiedTime: string;

  @Prop({ type: String })
  lastModifiedBy: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: String })
  subject: string;

  @Prop({ type: String })
  body: string;

  @Prop({ type: String })
  organizationId: string;

  // @Prop({ type: Object })
  // dynamicFields: any;
}

export const mailTemplateSchema = SchemaFactory.createForClass(MailTemplate);
