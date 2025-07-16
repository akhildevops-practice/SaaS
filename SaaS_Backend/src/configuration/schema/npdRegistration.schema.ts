import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class npdRegistration extends Document {
  @Prop({ type: String })
  organizationId: string;

  @Prop({ type: String })
  deptId: string;

  @Prop({ type: String, unique: true })
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

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const NpdRegistrationSchema =
  SchemaFactory.createForClass(npdRegistration);
