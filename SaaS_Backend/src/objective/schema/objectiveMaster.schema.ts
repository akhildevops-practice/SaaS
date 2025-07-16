import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class objectiveMaster extends Document {
  @Prop({ type: String })
  ObjectiveName: string;

  @Prop({ type: String })
  ObjectiveId: string;

  @Prop({ type: String })
  locationId: string;

  @Prop({ type: Array })
  ObjectiveCategory: [string];

  @Prop({ type: String })
  ObjectiveYear: string;

  @Prop({ type: String })
  Description: string;
  @Prop({ type: String })
  resources: string;
  @Prop({ type: String })
  evaluationProcess: string;
  @Prop({ type: Array })
  systemTypes: [string];

  @Prop({ type: String })
  Reason: string;

  @Prop({ type: Date, default: Date.now() })
  ModifiedDate: Date;

  @Prop({ type: JSON })
  ModifiedBy: object;

  @Prop({ type: String })
  ObjectivePeriod: string;

  @Prop({ type: String })
  EntityTypeId: string;

  @Prop({ type: String })
  ObjectiveType: string;

  @Prop({ type: Array })
  ObjectiveLinkedId: [string];

  @Prop({ type: String })
  OrganizationId: string;

  @Prop({ type: String })
  ObjectiveStatus: string;

  @Prop({ type: String })
  ObjectivedocStatus: string;

  @Prop({ type: String })
  Readers: string;

  @Prop({ type: Array })
  ReadersList: [string];

  @Prop({ type: Array })
  ReviewList: [string];

  @Prop({ type: Array })
  Objective: [string];

  @Prop({ type: String })
  Owner: string;

  @Prop({ type: String })
  OwnerShipType;

  @Prop({ type: String })
  OwnershipEntity: string;

  @Prop({ type: String })
  MilestonePeriod: string;

  @Prop({ type: String })
  ParentObjective: string;

  @Prop({ type: String })
  Scope: string;

  @Prop({ type: String })
  ScopeType: string;

  @Prop({ type: Object })
  ScopeDetails: object;

  @Prop({ type: Array })
  Goals: [string];

  @Prop({ type: JSON })
  createdBy: Object;

  @Prop({ type: JSON })
  associatedKpis: Object;

  @Prop({ type: Date, default: Date.now() })
  createdAt: Date;
}

export const objectiveMasterSchema =
  SchemaFactory.createForClass(objectiveMaster);
