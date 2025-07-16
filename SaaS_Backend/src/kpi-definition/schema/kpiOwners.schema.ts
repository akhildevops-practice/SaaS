import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsNumberString, IsString, Matches } from 'class-validator';
import { Date, Document } from 'mongoose';

export type kpiOwnerDocument = KpiOwner & Document;

@Schema({ timestamps: true })
export class KpiOwner {
  @Prop({ type: String, required: true })
  locationId: string;
  @Prop({ type: String, required: true })
  entityId: string;
  @Prop({ type: String })
  createdModifiedBy: string;
  @Prop({ type: Array })
  owner: [JSON];
}

export const KpiOwnerSchema = SchemaFactory.createForClass(KpiOwner);
