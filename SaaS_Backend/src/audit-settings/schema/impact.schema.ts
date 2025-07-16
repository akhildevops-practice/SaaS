import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ImpactDocument = Impact & Document;

@Schema({ timestamps: true })
export class Impact {
  @Prop({ type: [String] })
  impact: string[];

  @Prop({ type: String })
  impactType: string;

  @Prop({ type: String })
  organizationId: string;

  @Prop({ type: String })
  createdBy: string;

  @Prop({ type: String })
  updatedBy: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const ImpactSchema = SchemaFactory.createForClass(Impact);
