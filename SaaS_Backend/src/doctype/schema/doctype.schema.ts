import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Doctype extends Document {
  @Prop({ type: [String], default: [] })
  applicable_locations: string[];

  @Prop({ type: String })
  documentTypeName?: string;

  @Prop({ type: String })
  documentNumbering?: string;

  @Prop({ type: Number })
  reviewFrequency?: number;

  @Prop({ type: Number, default: 30 })
  revisionRemind?: number;

  @Prop({ type: String })
  prefix?: string;

  @Prop({ type: String })
  suffix?: string;

  @Prop({ type: String })
  organizationId?: string;

  @Prop({ type: String })
  docReadAccess?: string;

  @Prop({ type: Array, default: [] })
  docReadAccessIds: any[];

  @Prop({ type: String })
  docCreateAccess?: string;

  @Prop({ type: Array, default: [] })
  docCreateAccessIds?: any[];

  @Prop({ type: String })
  whoCanDownload?: string;

  @Prop({ type: Array, default: [] })
  whoCanDownloadIds?: any[];

  @Prop({ type: String })
  docDistributionList?: string;

  @Prop({ type: Array, default: [] })
  docDistributionListIds?: any[];

  @Prop({ type: Array, default: [] })
  applicable_systems: any[];

  @Prop({ type: String })
  versionType: string;

  @Prop({ type: String })
  initialVersion: string;

  @Prop({ type: String })
  currentVersion: string;

  @Prop({ type: String })
  updatedBy?: string;

  @Prop({ type: String })
  createdBy?: string;

  @Prop({ type: Date, default: null })
  deletedAt?: any;

  @Prop({ type: String })
  workflowId?: string;

  @Prop({ type: Boolean })
  default?: boolean;

  @Prop({ type: String })
  documentFormId?: string;
}

export const DoctypeSchema = SchemaFactory.createForClass(Doctype);
