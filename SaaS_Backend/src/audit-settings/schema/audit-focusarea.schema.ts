import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class AuditFocusArea extends Document {
  @Prop({ type: String })
  auditFocus: string;

  @Prop({ type: Array })
  areas: string[];

  @Prop({ type: String })
  organizationId: string;
}

export const AuditFocusAreaSchema =
  SchemaFactory.createForClass(AuditFocusArea);
