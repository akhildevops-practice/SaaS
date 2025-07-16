import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type QuestionDocument = Question & Document;

@Schema({ timestamps: true })
export class Question {
  @Prop({ type: String })
  id: String;

  @Prop({ type: String, required: true })
  title: String;

  @Prop({ type: String, required: true })
  inputType: String;

  @Prop({
    type: [
      {
        name: {
          type: String,
        },
        value: {
          type: Number,
        },
        checked: {
          type: Boolean,
        },
      },
    ],
  })
  options: [any];

  @Prop({ type: Number, default: 0 })
  questionScore: Number;

  @Prop({
    type: [
      {
        name: {
          type: String,
        },
        value: {
          type: Number,
        },
        score: {
          type: Number,
        },
      },
    ],
  })
  score: [any];

  @Prop({
    type: Boolean,
    default: false,
  })
  required: Boolean;

  @Prop({
    type: Boolean,
    default: true,
  })
  allowImageUpload: Boolean;

  @Prop({ type: String })
  value: String;

  @Prop({ type: String })
  hint: String;

  @Prop({ type: Boolean })
  slider: Boolean;

  @Prop({ type: Boolean })
  open: Boolean;

  @Prop({ type: String })
  image: String;

  @Prop({ type: String })
  imageName: String;

  @Prop({
    type: {
      type: {
        type: String,
      },
      clause: {
        type: String,
      },
      // severity: {
      //   type: String,
      // },
      comment: {
        type: String,
      },
      statusClause: { type: Boolean },
    },
  })
  nc: any;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
