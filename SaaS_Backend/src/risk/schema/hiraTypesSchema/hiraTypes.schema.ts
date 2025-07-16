import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class HiraTypeConfig extends Document {
  @Prop({ type: String })
  organizationId: string;

  @Prop({ type: String })
  name: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: String })
  locationId: string;

  @Prop({ type: String })
  type: string;

  @Prop({ type: String })
  createdBy: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;

  @Prop({ type: String })
  updatedBy: string;
  
  @Prop({ type: Boolean, default: false })
  deleted : false;

  @Prop({ type: Date, default: null })
  deletedAt: Date;
}

export const HiraTypeConfigSchema = SchemaFactory.createForClass(HiraTypeConfig);
