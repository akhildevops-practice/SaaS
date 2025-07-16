import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class docWorkflowHistoy extends Document {
  @Prop({ type: String })
  documentId: string;

  @Prop({ type: String })
  actionBy: string;

  @Prop({ type: String })
  actionName: string;

  @Prop({ type: Object })
  digiSign: any;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const docWorkflowHistoySchema =
  SchemaFactory.createForClass(docWorkflowHistoy);
