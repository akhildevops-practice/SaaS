import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class HiraSteps extends Document {
  @Prop({ type: Number, default: 1 })
  sNo: number;

  @Prop({ type: String, default: '1.1' })
  subStepNo: string;

  @Prop({ type: String })
  jobBasicStep: string;

  @Prop({ type: String })
  riskSource: string;

  @Prop({ type: Date, required: false })
  regDate: Date;

  @Prop({ type: String })
  riskDetailedScenario: string;

  @Prop({ type: String })
  riskOwner: string;

  @Prop({
    type: {
      riskTypeId: { type: String, required: false },
      riskConditionId: { type: String, required: false },
      currentControlId: { type: String, required: false },
      impactType: {
        type: {
          format: { type: String, enum: ['dropdown', 'text'], required: true },
          id: { type: String, required: false },
          text: { type: String, required: false },
        },
        required: false,
      },
      existingRiskRatingId: { type: String, required: false },
      targetRiskRatingId: { type: String, required: false },
      existingKeyControlId: { type: String, required: false },
      actualRiskRatingId: { type: String, required: false },
      currentControlEffectivenessId: { type: String, required: false },
      riskManagementDecisionId: { type: String, required: false },
    },
    required: false,
  })
  riskDetails: {
    riskTypeId?: string;
    riskConditionId?: string;
    currentControlId?: string;
    impactType?: {
      format: 'dropdown' | 'text';
      id?: string;
      text?: string;
    };
    existingRiskRatingId?: string;
    targetRiskRatingId?: string;
    existingKeyControlId?: string;
    actualRiskRatingId?: string;
    currentControlEffectivenessId?: string;
    riskManagementDecisionId?: string;
  };

  @Prop({ type: String })
  existingControl: string;

  @Prop({ type: Number, default: 0 })
  likelihood: number;

  @Prop({ type: Number, default: 0 })
  impact: number;

  @Prop({ type: Number, default: 0 })
  baseScore: number;

  @Prop({ type: Boolean, default: false })
  requireRiskTreatment: boolean;

  @Prop({ type: String })
  additionalControlDescription: string;

  @Prop({ type: Date, required: false })
  targetDate: Date;

  @Prop({ type: String })
  responsiblePerson: string;

  @Prop({ type: Array })
  responsibility: string[];

  @Prop({ type: Number, default: 0 })
  actualLikelihood: number;

  @Prop({ type: Number, default: 0 })
  actualImpact: number;

  @Prop({ type: Number, default: 0 })
  residualScore: number;

  @Prop({ type: Boolean, default: false })
  residualRiskAccepted: boolean;

  @Prop({ type: String })
  monitoringDetails: string;

  @Prop({ type: Date })
  nextReviewDate: Date;

  @Prop({ type: String })
  status: string;

  @Prop({ type: String })
  locationId: string;

  @Prop({ type: String })
  entityId: string;

  @Prop({ type: String })
  categoryId: string;

  @Prop({ type: String })
  createdBy: string;

  @Prop({ type: Date, default: null })
  deletedAt: Date;
}

export const HiraStepsSchema = SchemaFactory.createForClass(HiraSteps);
