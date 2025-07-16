// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { Document } from 'mongoose';

// @Schema({ timestamps: true })
// export class RiskConfig extends Document {
//   @Prop({ type: String })
//   organizationId: string;

//   @Prop({ type: String })
//   riskCategory: string;

//   @Prop({
//     type: [
//       {
//         name: String,
//         createdAt: { type: Date, default: Date.now },
//         updatedAt: { type: Date, default: Date.now },
//       },
//     ],
//   })
//   condition: any[];

//   @Prop({
//     type: [
//       {
//         name: String,
//         createdAt: { type: Date, default: Date.now },
//         updatedAt: { type: Date, default: Date.now },
//       },
//     ],
//   })
//   riskType: any[];

//   @Prop({
//     type: [
//       {
//         name: String,
//         createdAt: { type: Date, default: Date.now },
//         updatedAt: { type: Date, default: Date.now },
//       },
//     ],
//   })
//   impactType: any[];

//   @Prop({ type: Array })
//   riskCumulativeHeader: any[];



//   @Prop({
//     type: [
//       {
//         criteriaType: String,
//         score1Text: String,
//         score2Text: String,
//         score3Text: String,
//         score4Text: String,
//         score5Text: String,
//       },
//     ],
//   })
//   riskCumulative: {
//     criteriaType: string;
//     score1Text: string;
//     score2Text: string;
//     score3Text: string;
//     score4Text: string;
//     score5Text: string;
//   }[];

//   @Prop({
//     type: [
//       {
//         criteriaType: String,
//         score1Text: String,
//         score2Text: String,
//         score3Text: String,
//         score4Text: String,
//       },
//     ],
//   })
//   riskFactorial: {
//     criteriaType: string;
//     score1Text: string;
//     score2Text: string;
//     score3Text: string;
//     score4Text: string;
//   }[];
  
//   @Prop({
//     type: [
//       {
//         riskIndicator: String,
//         riskLevel: String,
//       },
//     ],
//   })
//   riskSignificance: {
//     riskIndicator: string;
//     riskLevel: string;
//   }[];

//   @Prop({ type: String })
//   computationType: string;

//   @Prop({ type: String })
//   createdBy: string;

//   @Prop({ type: Date, default: Date.now })
//   createdAt: Date;

//   @Prop({ type: Date, default: Date.now })
//   updatedAt: Date;

//   @Prop({ type: String })
//   updatedBy: string;
// }

// export const RiskConfigSchema = SchemaFactory.createForClass(RiskConfig);


import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class RiskConfig extends Document {
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
  riskMatrix: Record<string, Record<string, {
    score: number;
    riskLevel: string;
    description: string;
  }>>;

  @Prop({
    type: [
      {
        riskIndicator: String,
        riskLevel: String,
        description: String,
      },
    ],
    default: [],
  })
  riskLevelData: {
    riskIndicator: string;
    riskLevel: string;
    description: string;
  }[];

  @Prop({ type: String })
  computationType: string;

  @Prop({ type: String })
  createdBy: string;

  @Prop({ type: String })
  updatedBy: string;
}

export const RiskConfigSchema = SchemaFactory.createForClass(RiskConfig);

