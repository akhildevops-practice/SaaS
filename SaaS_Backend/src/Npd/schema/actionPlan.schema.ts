import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Define the interface representing the structure of the
// Create the Mongoose schema
@Schema({ timestamps: true })
export class ActionPlan extends Document {
  @Prop({ type: String })
  selectedDptId: "";

  @Prop({ type: String })
  momId: "";

  @Prop({ type: String })
  itemId: "";

  @Prop({ type: String })
  type: "";

  @Prop({ type: String })
  actionPlanName: "";
  
  @Prop({ type: Object })
  pic: {};

  @Prop({ type: String })
  targetDate: "";

  @Prop({ type: String })
  report: "";

  @Prop({ type: String })
  statusUpdate: "";

  @Prop({ type: String  })
  status: "";

  @Prop({ type: String })
  dateOfUpdate: "";

  @Prop({ type: Boolean , default: false })
  addButtonStatus: boolean;

  @Prop({ type: Boolean , default: false })
  buttonStatus: boolean;

  @Prop({ type: String })
  npdId: "";

  @Prop({ type: String })
  npdName: "";

  @Prop({ type: Array })
  statusProgressData: [];

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
export const ActionPlanSchema = SchemaFactory.createForClass(ActionPlan);