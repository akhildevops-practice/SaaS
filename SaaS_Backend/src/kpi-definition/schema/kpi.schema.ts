import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsNumberString, IsString, Matches } from 'class-validator';
import { Date, Document } from 'mongoose';

export type kpiDocument = Kpi & Document;

@Schema({ timestamps: true })
export class Kpi {
  @Prop({ type: String, required: true })
  kpiName: string;

  @Prop({ type: String })
  kpiType: string;

  @Prop({ type: Array })
  keyFields: [string];

  @Prop({ type: String, required: true })
  unitTypeId: String;

  @Prop({ type: String })
  sourceId: String;

  @Prop({ type: String })
  uom: String;

  @Prop({ type: Boolean, default: false })
  op: Boolean;
  @Prop({ type: String })
  kpiStatus: String;

  @Prop({ type: String })
  displayType: string;

  @Prop({ type: String })
  apiEndPoint: String;
  @Prop({ type: Boolean, default: false })
  deleted: boolean;
  @Prop({ type: String })
  kpiDescription: String;
  @Prop({
    type: String,
    //   validate: {
    //     validator: function (value) {
    //       // Match either pure number or floating point number
    //       return /^\d+(\.\d+)?$/.test(value);
    //     },
    //     message: 'kpiTarget must be a valid numeric or float string',
    //   },
    // })
    // @IsString({ message: 'kpiTarget must be a string' })
    // @Matches(/^\d+(\.\d+)?$/, {
    //   message: 'kpiTarget must be a valid numeric or float string',
  })
  kpiTarget: string;

  @Prop({ type: String })
  kpiMinimumTarget: String;
  @Prop({ type: Array })
  owner: [JSON];

  @Prop({ type: String })
  kpiTargetType: String;

  @Prop({ type: String, required: true })
  organizationId: String;

  @Prop({ type: String, required: true })
  locationId: String;
  @Prop({ type: String })
  entityId: String;
  @Prop({ type: Array })
  objectiveId: [String];
  @Prop({ type: String })
  categoryId: String;
  @Prop({ type: String })
  frequency: String;
  @Prop({ type: Date })
  startDate: Date;
  @Prop({ type: Date })
  endDate: Date;
}

export const KpiSchema = SchemaFactory.createForClass(Kpi);
