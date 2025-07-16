import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class organizationGoal extends Document {
  @Prop({ type: String })
  Year: string;

  @Prop({ type: String })
  ObjectiveCategory: string;

  @Prop({ type: String })
  Description: string;

  @Prop({ type: Date, default: Date.now() })
  ModifiedDate: Date;

  @Prop({ type: Object })
  ModifiedBy: JSON;

  @Prop({ type: String })
  organizationId: string;

  @Prop({ type: String })
  status: string;
}

const OrganizationGoalSchema = SchemaFactory.createForClass(organizationGoal);

OrganizationGoalSchema.index(
  { Year: 1, ObjectiveCategory: 1, organizationId: 1 },
  { unique: true },
);

export { OrganizationGoalSchema };
