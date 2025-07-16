import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
@Schema({ timestamps: true })
export class CaraRcaSettings extends Document {
  //false means basic level
  @Prop({ type: String })
  analysisType: string;
  @Prop({ type: String })
  locationId: string;
  @Prop({ type: String })
  organizationId: string;
  @Prop({ type: String })
  createdBy: string;
}
export const cararcasettingsSchema =
  SchemaFactory.createForClass(CaraRcaSettings);
