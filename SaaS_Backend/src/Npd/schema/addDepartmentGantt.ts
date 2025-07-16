import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Define the interface representing the structure of the
// Create the Mongoose schema
@Schema({ timestamps: true })
export class addDepartmentGantt extends Document {
  @Prop({ type: Object })
  department: {};

  @Prop({ type: String })
  category: "";

  @Prop({ type: Array })
  pic: [];
  
  @Prop({ type: Object })
  stakeHolder: {};

  @Prop({ type: Array })
  departmentData: [];

  @Prop({ type: String })
  npdId: "";

  @Prop({ type: String })
  npdName: "";

  @Prop({ type: Date, default: Date.now() })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Boolean, default: false })
  deletedAt: boolean;
}

// Create the Mongoose schema factory
export const addDepartmentGanttSchema = SchemaFactory.createForClass(addDepartmentGantt);