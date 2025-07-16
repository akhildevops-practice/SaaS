import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
@Schema({ timestamps: true })
export class NcActionPoint extends Document {
  @Prop({ type: String })
  organizationId: string;

  @Prop({ type: String })
  ncNumber: String;

  @Prop({ type: String })
  ncDate: String;

  @Prop({ type: String })
  createdBy: String;

  @Prop({ type: String })
  ncId: String;

  @Prop({ type: String })
  createdAt: String;

  @Prop({ type: String })
  updatedAt: String;

  @Prop({ type: String })
  entity: String;

  @Prop({ type: String })
  title: String;

  @Prop({ type: Array })
  assignee: [string];

  @Prop({ type: String })
  description: String;

  @Prop({ type: String })
  comments: String;

  @Prop({ type: String })
  status: String;

  @Prop({ type: String })
  entityHead: String;
}

export const NcActionPointSchema = SchemaFactory.createForClass(NcActionPoint);
