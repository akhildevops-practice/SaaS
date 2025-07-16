import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
export type TicketSupportDocument = ticketSupport & Document;

@Schema({ timestamps: true })
export class ticketSupport extends Document {
  @Prop({ type: String, required: true })
  moduleName: string;

  @Prop({ type: String, required: true })
  createdBy: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: String, required: true })
  severity: string;

  @Prop({ type: String, required: true })
  organizationId: string;

  @Prop({ type: Boolean, default: false })
  status: boolean;
}

export const ticketSupportSchema = SchemaFactory.createForClass(ticketSupport);
