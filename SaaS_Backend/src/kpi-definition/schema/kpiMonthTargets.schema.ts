import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsNumberString, IsString, Matches } from 'class-validator';
import { Date, Document } from 'mongoose';
//this schema is used to store kpi target either month,quarter or half year targets
export type kpiMonthTargetDocument = KpiMonthTarget & Document;

@Schema({ timestamps: true })
export class KpiMonthTarget {
  @Prop({ type: String, required: true })
  kpiId: string;

  @Prop({ type: String })
  timePeriod: string; //month or quarter or h1 or h2

  @Prop({
    type: String,
    validate: {
      validator: function (value) {
        // Match either pure number or floating point number
        return /^\d+(\.\d+)?$/.test(value);
      },
      message: 'kpiTarget must be a valid numeric or float string',
    },
  })
  @IsString({ message: 'kpiTarget must be a string' })
  @Matches(/^\d+(\.\d+)?$/, {
    message: 'kpiTarget must be a valid numeric or float string',
  })
  target: string;
  @Prop({ type: String })
  minTarget: string;
  @Prop({ type: String })
  targetYear: string; //which year this target is appliczble to

  @Prop({ type: String })
  createdModifiedBy: string; //who created this
}

export const KpiMonthTargetSchema =
  SchemaFactory.createForClass(KpiMonthTarget);
