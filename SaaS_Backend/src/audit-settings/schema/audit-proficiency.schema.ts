import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Proficiency extends Document {
  @Prop({ type: String })
  proficiency: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: String })
  organizationId: string;
}

export const ProficiencySchema = SchemaFactory.createForClass(Proficiency);
