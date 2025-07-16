import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Date, Document, now } from 'mongoose';

@Schema({ timestamps: true })
export class CaraCapaOwner extends Document {
  @Prop({ type: String })
  organizationId: string;

  @Prop({ type: String })
  caraId: string;

  @Prop({ type: JSON })
  previousOwnerId: Object;

  @Prop({ type: JSON })
  updatedBy: Object;
  @Prop({ type: JSON })
  currentOwnerId: Object;
  @Prop({ type: Date, default: now() })
  updatedAt: Date;

  @Prop({ type: String })
  reason: string;
}

export const CapaCapaOwner = SchemaFactory.createForClass(CaraCapaOwner);
