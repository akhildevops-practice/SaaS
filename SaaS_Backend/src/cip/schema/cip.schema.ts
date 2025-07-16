import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class CIP extends Document {
  @Prop({ type: String })
  organizationId: string;

  @Prop({ type: String })
  title: string;

  @Prop({ type: Array })
  cipCategoryId: [object];

  @Prop({ type: Array })
  cipTeamId: [string];

  @Prop({ type: Array })
  cipTypeId: [string];

  @Prop({ type: Array })
  cipOrigin: [string];

  @Prop({ type: String })
  justification: string;

  @Prop({ type: Number })
  cost: number;

  @Prop({ type: Array })
  tangibleBenefits: [Object];

  @Prop({ type: Array })
  files: [Object];

  @Prop({ type: String })
  year: string;

  @Prop({ type: Object })
  location: {
    id: string;
    name: string;
  };

  @Prop({ type: Object })
  createdBy: {
    id: string;
    name: string;
    avatar: any;
  };

  @Prop({ type: String })
  status: string;

  @Prop({ type: Array })
  reviewers: [Object];

  @Prop({ type: Array })
  approvers: [Object];

  @Prop({ type: String })
  cancellation: string;

  // @Prop({ type : Boolean})
  // deleted : boolean

  @Prop({ type: Object })
  entity: object;

  @Prop({ type: String })
  otherMembers: string;

  @Prop({ type: Date })
  plannedStartDate: Date;

  @Prop({ type: Date })
  plannedEndDate: Date;

  @Prop({ type: Date })
  actualStartDate: Date;

  @Prop({ type: Date })
  actualEndDate: Date;

  @Prop({ type: String })
  dropReason: string;

  @Prop({ type: Array })
  projectMembers: [Object];
}

export const CIPDocument = SchemaFactory.createForClass(CIP);
