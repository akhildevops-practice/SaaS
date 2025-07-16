import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class AppField extends Document {
  @Prop({ type: String })
  name: string;

  @Prop({ type: Array })
  options: string[];

  @Prop({ type: String })
  organizationId: string;
}

export const AppFieldSchema = SchemaFactory.createForClass(AppField);
