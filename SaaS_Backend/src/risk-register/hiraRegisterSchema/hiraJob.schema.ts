import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';


@Schema({ timestamps: true })
export class HiraJob extends Document {
  
  @Prop({ type: String })
  jobTitle: string;

  @Prop({ type: String })
  organizationId: string;

  @Prop({ type: String })
  locationId: string;

  @Prop({ type: String })
  entityId: string;

  @Prop({ type: String })
  section: string;

  @Prop({ type: String })
  area: string;

  @Prop({ type: String })
  riskType: string;

  @Prop({ type: String })
  condition: string;

  @Prop({ type: Array })
  assesmentTeam: [string];

  @Prop({ type: String})
  additionalAssesmentTeam: string;

  @Prop({ type: Array})
  stepIds: [string];

  @Prop({ type: String })
  createdBy: string;

  @Prop({ type: Date, default : null })
  deletedAt : Date
}

export const HiraJobSchema = SchemaFactory.createForClass(HiraJob);
