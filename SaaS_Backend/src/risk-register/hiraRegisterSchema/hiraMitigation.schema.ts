import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class HiraMitigation extends Document {
  @Prop({ type: String })
  title: string;

  @Prop({ type: String })
  stage: string;

  @Prop({ type: String })
  status: string;

  @Prop({ type: String })
  owner: string;

  @Prop({ type: String })
  responsibleOfficial: string;

  @Prop({ type: Date, default: Date.now })
  targetDate: Date;

  @Prop({ type: String })  //comments are nothing but control measures in Mitigation Form
  comments: string;

  // @Prop({
  //   type: Object,
  //   refType: { type: String },
  //   id: { type: String },
  //   name: { type: String },
  //   url: { type: String },
  // })
  // references: {
  //   refType: string;
  //   id: string;
  //   name: string;
  //   url: string;
  // };

  @Prop({ type: Date })
  lastScoreUpdatedAt?: Date;

  @Prop({ type: String })
  lastScore: string;

  @Prop({ type: String })
  createdBy: string;

  @Prop({ type: String })
  updatedBy: string;

  @Prop({ type: Boolean, default: false })
  deleted : boolean

  @Prop({ type: Date, default : null })
  deletedAt : Date


}
export const HiraMitigationSchema =
  SchemaFactory.createForClass(HiraMitigation);
