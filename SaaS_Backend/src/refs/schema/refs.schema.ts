import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Refs extends Document {
  @Prop({ type: String })
  organizationId: string;

  @Prop({ type: String })
  type: string;

  @Prop({ type: String })
  name: string;

  @Prop({ type: String })
  comments: string;

  @Prop({ type: Types.ObjectId, required: true })
  refTo: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  refId: Types.ObjectId;

  @Prop({ type: String })
  link: string;

  @Prop({ type: String })
  createdBy: string;

  @Prop({ type: String })
  updatedBy: string;

  @Prop({ type: String })
  refToModule: string;
  
  @Prop({ type: Boolean, default: false })
  isFlagged: boolean;
}

export const RefsSchema = SchemaFactory.createForClass(Refs);
