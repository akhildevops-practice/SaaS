import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Define the interface representing the structure of the
// Create the Mongoose schema
@Schema({ timestamps: true })
export class RiskPrediction extends Document {
  @Prop({ type: String })
  selectedDptId: "";

  @Prop({ type: String })
  momId: "";

  @Prop({ type: String })
  riskType: "";

  @Prop({ type: String })
  itemName: "";

  @Prop({ type: String })
  itemNameDescription: "";

  @Prop({ type: String })
  delayedItemGanttId: "";

  @Prop({ type: String })
  itemId: "";

  @Prop({ type: Array })
  riskHistory: [];

  @Prop({ type: String })
  itemType: "";

  @Prop({ type: String })
  criticality: "";

  @Prop({ type: Array })
  impact: [];

  @Prop({ type: String })
  riskPrediction: "";

  @Prop({ type: String  })
  status: "";

  @Prop({ type: String  })
  targetDate: "";

  @Prop({ type: Array })
  pic: [];

  @Prop({ type: Array })
  actionPlans: [];

  @Prop({ type: Array })
  actionPlansIds: [];

  @Prop({ type: Array })
  dropDptValue: [];

  @Prop({ type: Boolean , default: false })
  addButtonStatus: boolean;

  @Prop({ type: Boolean , default: false })
  buttonStatus: boolean;

  @Prop({ type: String })
  npdId: "";

  @Prop({ type: String })
  npdName: "";

  @Prop({ type: String })
  report: "";

  @Prop({ type: String })
  notes: "";

  @Prop({ type: Boolean, default: false })
  currentVersion: boolean;

  @Prop({ type: Date})
  riskCreatedDate: Date;

  @Prop({ type: Date, default: Date.now() })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Boolean, default: false })
  deletedAt: boolean;

  @Prop({ type: String })
  createdBy: string;

  @Prop({ type: Date })
  createdOn: Date;

}

// Create the Mongoose schema factory
export const RiskPredictionSchema = SchemaFactory.createForClass(RiskPrediction);