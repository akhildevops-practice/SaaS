import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
@Schema({ timestamps: true })
export class cara_settings extends Document {
  @Prop({ type: String })
  deviationType: string;
  @Prop({ type: String })
  organizationId: string;
  @Prop({ type: String })
  createdBy: string;
  @Prop({ type: String })
  description: string;
  // @Prop({ type: Boolean, default: false })
  // deleted: boolean;
}
export const carasettingsSchema = SchemaFactory.createForClass(cara_settings);
