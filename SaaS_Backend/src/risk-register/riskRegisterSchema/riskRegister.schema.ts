import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { riskMitigation } from './riskMitigation.schema';

@Schema({ timestamps: true })
export class Riskschema extends Document {
  @Prop({ type: String })
  jobTitle: string;

  @Prop({ type: Types.ObjectId, ref: 'RiskConfig' })
  riskConfigId: string;

  @Prop({ type: Types.ObjectId, ref: 'riskConfig' })
  riskType: string;

  @Prop({ type: Types.ObjectId, ref: 'riskConfig' })
  condition: string;

  @Prop({ type: String })
  location: string;

  @Prop({type: String})
  jobBasicStep: string;

  @Prop({ type: String })
  existingControl: string;

  @Prop({ type: String })
  entity: string;

  @Prop({ type: String })
  section: string;

  @Prop({ type: String })
  area: string;

  @Prop({ type: Date, default: Date.now })
  dateOfIdentification: Date;

  @Prop({ type: Date })
  closeDate: Date;

  @Prop({ type: Array })
  users: [string];

  @Prop({ type: String })
  activity: string;

  @Prop({ type: String })
  status: string;

  @Prop({ type: String })
  description: string;

  @Prop({
    type: Object,
    refType: { type: String },
    id: { type: String },
    name: { type: String },
    url: { type: String },
  })
  references: {
    refType: string;
    id: string;
    name: string;
    url: string;
  };

  @Prop({ type: String })
  organizationId: string;

  @Prop({ type: String })
  impactType: string;

  @Prop({ type: String })
  riskImpact: string;

  @Prop([{ type: String, ref: 'riskMitigation' }])
  mitigations: string[];

  @Prop({
    type: [],
  })
  preMitigation: [];

  @Prop({ type: Number, default: 0 })
  preMitigationScore: number;

  @Prop({
    type: [],
  })
  postMitigation: [];

  @Prop({ type: Number, default: 0 })
  postMitigationScore: number;

  @Prop({ type: Number, default: 0 })
  significanceScore: number;


  @Prop({ type: Array })
  reviewers: [string];

  @Prop({ type: Array })
  assesmentTeam: [string];

  @Prop({ type: Array })
  riskReviewers: [string];
  
  @Prop({ type: Array })
  riskApprovers  : [string];

  @Prop({ type: Array })
  attachments  : [];

  @Prop({ type: String })
  prefixSuffix: string;

  @Prop({ type: String })
  createdBy: string;

  @Prop({ type: String })
  updatedBy: string;
}

export const riskSchema = SchemaFactory.createForClass(Riskschema);
