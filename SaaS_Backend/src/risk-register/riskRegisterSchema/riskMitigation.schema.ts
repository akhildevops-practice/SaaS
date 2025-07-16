import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class riskMitigation extends Document {
  @Prop({ type: String })
  title: string;

  @Prop({ type: String })
  stage: string;

  @Prop({ type: String })
  status: string;

  @Prop({ type: String })
  owner: string;

  @Prop({ type: Date, default: Date.now })
  targetDate: Date;

  @Prop({ type: String })
  comments: string;

  @Prop({
    type: Object,
    refType: { type: String },
    id: { type: String },
    name: { type: String },
    url: { type: String },
  })
  references: {
    refType: string;
    id: string;
    name: string;
    url: string;
  };

  @Prop({ type: Date })
  lastScoreUpdatedAt?: Date;

  @Prop({ type: String })
  lastScore: string;


}
export const riskMitigationDocument =
  SchemaFactory.createForClass(riskMitigation);
