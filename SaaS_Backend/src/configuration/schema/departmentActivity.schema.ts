import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class npdConfig extends Document {
  @Prop({ type: String })
  organizationId: string;

  @Prop({ type: String })
  deptId: string;

  @Prop({ type: String })
  deptActivityId: string;

  @Prop({ type: Array })
  pic: [string];

  @Prop({ type: Array })
  reviewers: [string];

  @Prop({ type: Array })
  approvers: [string];

  @Prop({ type: Array })
  notification: [string];

  @Prop({ type: Array })
  escalationList: [string];

  @Prop({ type: Array })
  activity: [];

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;

  @Prop({ type: String })
  createdBy: string;

  @Prop({ type: String })
  updatedBy: string;
}

export const npdConfigSchema = SchemaFactory.createForClass(npdConfig);
