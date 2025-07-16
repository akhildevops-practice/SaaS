import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class CaraDefects extends Document {
  @Prop({ type: String })
  organizationId: string;
  //to store defect typess for a specific product
  @Prop({ type: Array })
  defectType: [];
  //to store to which product these defects are associated with
  @Prop({ type: Object })
  productId: JSON;

  @Prop({ type: String })
  createdBy: string;
  @Prop({ type: String })
  updatedBy: string;
  //usually location will be product associated location
  @Prop({ type: String })
  locationId: string;
  //to make it obsolete
  @Prop({ type: Boolean, default: false })
  deleted: boolean;
}

export const CapaDefects = SchemaFactory.createForClass(CaraDefects);
