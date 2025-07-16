import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Configuration extends Document {
  @Prop({ type: String })
  organizationId: string;

  @Prop({ type: Array })
  pm: [string];

  @Prop({ type: Array })
  projectTypes: [string];

  @Prop({ type: String })
  projectInfo: string;

  @Prop({ type: Array })
  productTypes: [string];

  @Prop({ type: String })
  productInfo: string;

  @Prop({ type: Array })
  rankType: [string];

  @Prop({ type: String })
  rankInfo: string;

  @Prop({ type: Array })
  numbering: [];

  @Prop({ type: Array })
  ProjectTracking: [];

  @Prop({ type: Array })
  riskConfig: [];

  @Prop({ type: Array })
  impactArea: [];

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;

  @Prop({ type: String })
  createdBy: string;

  @Prop({ type: String })
  updatedBy: string;
}

export const ConfigurationSchema = SchemaFactory.createForClass(Configuration);
