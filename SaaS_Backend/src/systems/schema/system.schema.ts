import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SystemDocument = System & Document;

@Schema({ timestamps: true })
export class System {
  @Prop({ type: String, required: true })
  type: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;

  // @Prop({
  //   type: [
  //     {
  //       number: {
  //         type: String,
  //       },
  //       name: {
  //         type: String,
  //       },
  //       description: {
  //         type: String,
  //       },
  //     },
  //   ],
  //   required: true,
  // })
  // clauses: [Object];

  @Prop({
    type: [
      {
        id: {
          type: String,
        },
      },
    ],
  })
  applicable_locations: [Object];

  @Prop({ type: String })
  description: String;

  @Prop({ type: String, required: true })
  organizationId: String;

  @Prop({ type: Boolean, default: false })
  deleted: Boolean;

  @Prop({ type: Array })
  integratedSystems: [object];
}

export const SystemSchema = SchemaFactory.createForClass(System);
