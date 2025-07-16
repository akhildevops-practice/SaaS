import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class KRA extends Document {
  @Prop({ type: String })
  KraName: string;

  @Prop({ type: String })
  KraId: string;

  @Prop({ type: String })
  ObjectiveId: string;

  @Prop({ type: String })
  objective: string;

  @Prop({ type: String })
  Target: string;

  @Prop({ type: String })
  TargetType: string;

  @Prop({ type: String })
  UnitOfMeasure: string;

  @Prop({ type: Date })
  TargetDate: Date;

  @Prop({ type: Date })
  StartDate: Date;

  @Prop({ type: Date })
  EndDate: Date;

  @Prop({ type: String })
  ModifiedBy: string;

  @Prop({ type: Date, default: Date.now() })
  ModifiedDate: Date;

  @Prop({ type: String })
  Status;

  @Prop({ type: String })
  OrganizationId;

  @Prop({ type: String })
  Comments: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: String })
  UserName: string;

  @Prop({ type: String })
  ForEntity: string;

  @Prop({ type: Array })
  KpiReportId: [string];
  @Prop({ type: String })
  objectiveCategories: string;

  @Prop({ type: Array })
  associatedKpis: [];
}

export const kraSchema = SchemaFactory.createForClass(KRA);
