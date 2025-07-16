import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
@Schema({ timestamps: true })
export class caraBasicSettings extends Document {
  //basic level or advanced level field
  @Prop({ type: Boolean })
  settingsType: boolean;
  //since it is location basic
  @Prop({ type: String })
  locationId: string;
  @Prop({ type: String })
  organizationId: string;
  @Prop({ type: String })
  createdBy: string;
  @Prop({ type: String })
  description: string;
}
export const caraBasicSettingsSchema =
  SchemaFactory.createForClass(caraBasicSettings);
