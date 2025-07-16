import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsNumberString, IsString, Matches } from 'class-validator';
import { Date, Document } from 'mongoose';

export type objOwnerDocument = ObjOwner & Document;

@Schema({ timestamps: true })
export class ObjOwner {
  @Prop({ type: String, required: true })
  locationId: string;
  @Prop({ type: String, required: true })
  entityId: string;
  @Prop({ type: String })
  createdModifiedBy: string;
  @Prop({ type: Array })
  owner: [JSON];
}

export const ObjOwnerSchema = SchemaFactory.createForClass(ObjOwner);
