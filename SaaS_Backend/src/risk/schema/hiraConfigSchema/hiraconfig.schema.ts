import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class HiraConfig extends Document {
  @Prop({ type: String })
  organizationId: string;

  @Prop({ type: String })
  riskCategory: string;

  @Prop({
    type: [
      {
        value: String,
        label: String,
        description: String,
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  riskTypeOptions: any[];

  @Prop({
    type: [
      {
        value: String,
        label: String,
        description: String,
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  riskConditionOptions: any[];

  @Prop({
    type: [
      {
        value: String,
        label: String,
        description: String,
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  currentControlOptions: any[];

  @Prop({
    type: [
      {
        value: String,
        label: String,
        description: String,
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  impactTypeOptions: any[];

  @Prop({ type: String, enum: ['dropdown', 'text'], default: 'dropdown' })
  impactTypeFormat: string;

  @Prop({ type: Boolean, default: false })
  showExistingTargetRiskLevels: boolean;

  @Prop({
    type: [
      {
        value: String,
        label: String,
        description: String,
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  existingRiskRatingOptions: any[];

  @Prop({
    type: [
      {
        value: String,
        label: String,
        description: String,
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  targetRiskRatingOptions: any[];

  @Prop({
    type: [
      {
        value: String,
        label: String,
        description: String,
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  existingKeyControlOptions: any[];

  @Prop({
    type: [
      {
        value: String,
        label: String,
        description: String,
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  actualRiskRatingOptions: any[];

  @Prop({
    type: [
      {
        value: String,
        label: String,
        description: String,
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  currentControlEffectivenessOptions: any[];

  @Prop({
    type: [
      {
        value: String,
        label: String,
        description: String,
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  riskManagementDecisionOptions: any[];

  @Prop({ type: String })
  primaryClassification: string;

  @Prop({ type: String })
  secondaryClassification: string;

  @Prop({ type: String })
  tertiaryClassification: string;

  @Prop({ type: String })
  probabilityAxisLabel: string;

  @Prop({ type: String })
  severityAxisLabel: string;

  @Prop({ type: Number })
  probabilityWeightage: number;

  @Prop({ type: Number })
  severityWeightage: number;

  @Prop({ type: [String], default: [] })
  probabilityLabels: string[];

  @Prop({ type: [String], default: [] })
  severityLabels: string[];

  @Prop({ type: Object, default: {} })
  riskMatrix: Record<
    string,
    Record<
      string,
      {
        score: number;
        riskLevel: string;
        description: string;
      }
    >
  >;

  @Prop({
    type: [
      {
        riskIndicator: String,
        riskLevel: String,
        description: String,
        color: String,
        comparator: String,
        value: Number,
      },
    ],
    default: [],
  })
  riskLevelData: {
    riskIndicator: string;
    riskLevel: string;
    description: string;
    color: string;
    comprator: string;
    value: number;
  }[];

  @Prop({
    type: [
      {
        min: { type: Number, required: true },
        max: { type: Number, required: true },
        description: { type: String, required: true },
      },
    ],
    default: [],
  })
  riskRatingRanges: Array<{
    min: number;
    max: number;
    description: string;
  }>;

  @Prop({ type: String })
  computationType: string;

  @Prop({ type: String })
  createdBy: string;

  @Prop({ type: String })
  updatedBy: string;
}

export const HiraConfigSchema = SchemaFactory.createForClass(HiraConfig);
