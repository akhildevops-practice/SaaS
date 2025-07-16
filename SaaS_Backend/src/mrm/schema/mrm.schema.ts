import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
@Schema({ timestamps: true })
export class MRM extends Document {
  @Prop({ type: String })
  organizationId: string;

  @Prop({ type: String })
  momPlanYear: string;

  @Prop({ type: String })
  unitId: string;

  @Prop({ type: Array })
  mrmPlanData: [boolean];

  @Prop({ type: String })
  fiscalYear: String;

  // @Prop({ type: Array })
  // participants: [string];

  @Prop({ type: String })
  currentYear: String;

  @Prop({ type: Types.ObjectId, ref: 'MeetingType', required: true })
  keyAgendaId: Types.ObjectId;

  @Prop({ type: String })
  updatedBy: string;

  @Prop({ type: String })
  createdBy: String;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const MRMDocument = SchemaFactory.createForClass(MRM);
