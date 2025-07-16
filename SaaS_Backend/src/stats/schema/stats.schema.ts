import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Stats extends Document {
  @Prop({ type: String })
  userId: string;

  @Prop({ type: String })
  locationId: string;

  @Prop({ type: String })
  entityId: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const StatsSchema = SchemaFactory.createForClass(Stats);
