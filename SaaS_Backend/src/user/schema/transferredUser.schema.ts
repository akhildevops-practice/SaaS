import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
export type TransferredUserDocument = transferredUser & Document;

@Schema({ timestamps: true })
export class transferredUser extends Document {
  //username whose transfer was initiated
  @Prop({ type: String })
  userName: string;
  //userid
  @Prop({ type: String, required: true })
  userId: string;
  //who initiated the transfer
  @Prop({ type: String, required: true })
  transferredBy: string;
  //from which unit
  @Prop({ type: String })
  fromUnit: string;
  //to which unit
  @Prop({ type: String })
  toUnit: string;
  //what is the current status,default will be pending, on completion, completed
  @Prop({ type: String })
  status: string;
  //when was this initiated
  @Prop({ type: Date, default: Date.now() })
  initiatedOn: Date;
  //when was this completed
  @Prop({ type: Date, default: Date.now() })
  completedOn: Date;

  @Prop({ type: String, required: true })
  organizationId: string;
}

export const transferredUserSchema =
  SchemaFactory.createForClass(transferredUser);
