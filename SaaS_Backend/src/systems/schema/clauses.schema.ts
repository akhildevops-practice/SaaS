import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ClauseDocument = Clauses & Document;

@Schema({ timestamps: true })
export class Clauses {
  @Prop({ type: String, required: true })
  number: string;

  @Prop({ type: String, required: true })
  name: string;
  @Prop({ type: String })
  description: string;

  @Prop({ type: String, required: true })
  systemId: string;

  @Prop({ type: String, required: true })
  organizationId: String;
  @Prop({ type: Boolean, default: false })
  deleted: Boolean;
}

export const ClausesSchema = SchemaFactory.createForClass(Clauses);
