import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Google extends Document {
  @Prop({ type: String })
  organizationId: string;

  @Prop({ type: String })
  clientId: string;

  @Prop({ type: String })
  clientSecret: string;
}

export const GoogleDocument = SchemaFactory.createForClass(Google);
