import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
@Schema({ timestamps: true })
export class cara extends Document {
  @Prop({ type: String })
  organizationId: string;

  @Prop({ type: String })
  kpiId: String;

  @Prop({ type: String })
  title: String;
  @Prop({ type: String })
  registeredBy: string;

  @Prop({ type: String })
  caraOwner: string;
  @Prop({ type: String })
  caraCoordinator: string;

  @Prop({ type: String })
  comments: string;

  @Prop({ type: String })
  startDate: string;
  @Prop({ type: String })
  endDate: string;
  @Prop({ type: JSON })
  date: Object;

  @Prop({ type: String })
  kpiReportLink: string;

  @Prop({ type: String })
  locationId: string;

  @Prop({ type: String })
  serialNumber: string;

  @Prop({ type: String })
  entityId: string;
  @Prop({ type: Array })
  systemId: [string];

  @Prop({ type: String })
  description: string;
  // @Prop({ type: Boolean, default: false })
  // deleted: boolean;

  @Prop({ type: Array })
  rootCauseAnalysis: string;

  @Prop({ type: Array })
  containmentAction: string;
  @Prop({ type: String })
  type: string;

  @Prop({ type: String })
  auditId: string;

  @Prop({ type: String })
  origin: string;
  @Prop({ type: String })
  year: String;

  @Prop({ type: Array })
  files: [string];

  @Prop({ type: Array })
  attachments: [string];

  @Prop({ type: Array })
  registerfiles: [string];
  @Prop({ type: String })
  correctiveAction: string;
  @Prop({ type: String })
  actualCorrectiveAction: string;
  @Prop({ type: String })
  man: string;
  @Prop({ type: String })
  machine: string;
  @Prop({ type: String })
  material: string;
  @Prop({ type: String })
  method: string;
  @Prop({ type: String })
  measurement: string;
  @Prop({ type: String })
  environment: string;
  @Prop({ type: String })
  why1: string;
  @Prop({ type: String })
  why2: string;
  @Prop({ type: String })
  why3: string;
  @Prop({ type: String })
  why4: string;
  @Prop({ type: String })
  why5: string;

  @Prop({ type: String })
  impactType: string;

  @Prop({ type: Array })
  impact: [];

  @Prop({ type: Boolean, default: false })
  highPriority: boolean;

  @Prop({
    type: String,
    default: 'OPEN',
  })
  status: string;

  @Prop({ type: String })
  targetDate: string;

  @Prop({ type: String })
  correctedDate: string;

  //field for advanced
  @Prop({ type: String })
  productId: string;

  @Prop({ type: String })
  defectType: string;

  @Prop({ type: String })
  analysisLevel: string;

  @Prop({ type: String })
  analysisId: string;

  @Prop({ type: Array })
  outcome: [JSON];
  @Prop({ type: String })
  onePointLesson: string;
  @Prop({ type: String })
  referenceComments: string;
  @Prop({ type: Array })
  referenceAttachments: [string];
}

export const caraSchema = SchemaFactory.createForClass(cara);
