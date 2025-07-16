import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class docProcess extends Document {
  @Prop({ type: String })
  organizationId: string;

  @Prop({ type: String })
  documentId: string;

  @Prop({ type: String })
  docUrl: string;

  @Prop({ type: String })
  batchId: string;

  @Prop({ type: String })
  status: string; //pending or completed

  @Prop({ type: String })
  reason: string; //failed reason

  @Prop({ type: String })
  fileName: string;

  @Prop({ type: String })
  type: string; //pending or completed

  @Prop({ type: String })
  createdBy: string;

  @Prop({ type: Boolean, default: false })
  isFailed: boolean;

  @Prop({ type: String })
  failedReason: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const docProcessSchema = SchemaFactory.createForClass(docProcess);
