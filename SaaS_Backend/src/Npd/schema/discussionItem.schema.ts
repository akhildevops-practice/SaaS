import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Define the interface representing the structure of the
// Create the Mongoose schema
@Schema({ timestamps: true })
export class DiscussionItem extends Document {
  @Prop({ type: String })
  selectedDptId: "";

  @Prop({ type: String })
  parentId: "";

  @Prop({ type: String })
  momId: "";

  @Prop({ type: String })
  discussedItem: "";

  @Prop({ type: String })
  discussedItemDescription: "";
  
  @Prop({ type: String })
  criticality: "";

  @Prop({ type: Array })
  impact: [];

  @Prop({ type: Array })
  riskHistory: [];
  
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
  
  @Prop({ type: Date, default: Date.now() })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Boolean, default: false })
  deletedAt: boolean;

  @Prop({ type: Boolean, default: false })
  currentVersion: boolean;

  @Prop({ type: String })
  createdBy: string;

  @Prop({ type: Date })
  createdOn: Date;

}

// Create the Mongoose schema factory
export const DiscussionItemSchema = SchemaFactory.createForClass(DiscussionItem);