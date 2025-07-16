import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AuditTemplateDocument = AuditTemplate & Document;

@Schema({ timestamps: true })
export class AuditTemplate {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String })
  run_id: string;

  @Prop({ type: Boolean, required: true })
  isDraft: boolean;

  @Prop({ type: Boolean, required: true })
  status: boolean;

  @Prop({ type: String, required: true })
  createdBy: string;

  @Prop({ type: Array, required: true })
  locationName: [];

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;

  @Prop({ type: String })
  publishedDate?: string;

  @Prop({ type: String })
  organizationId: String;

  @Prop({ type: Boolean, default : false })
  isAiGenerated: boolean;

  @Prop({ type: String })
  entityId: String;

  @Prop({ type: String, default: "" })
  scheduleId: String;

  @Prop({
    type: [
      {
        title: {
          type: String,
          required: true,
        },
        totalScore: {
          type: Number,
          required: true,
        },
        obtainedScore: {
          type: Number,
          required: true,
        },
        fieldset: [
          {
            type: Types.ObjectId,
            ref: 'Question',
          },
        ],
      },
    ],
    required: true,
  })
  sections: [any];
}

export const AuditTemplateSchema = SchemaFactory.createForClass(AuditTemplate);
