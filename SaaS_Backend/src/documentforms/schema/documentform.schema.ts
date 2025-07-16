import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


@Schema({ timestamps: true })
export class Documentform extends Document {
  @Prop({ type: String, required: true })
  formTitle: string;

  @Prop({ type: Array, default: [] })
  fields: any[];

  @Prop({ type: String})
  organizationId: string;

  @Prop({ type: String })
  createdBy?: string;

  @Prop({ type: String })
  updatedBy?: string;

  @Prop({ type: Date, default: null })
  deletedAt?: Date;
}

export const DocumentformSchema = SchemaFactory.createForClass(Documentform);
