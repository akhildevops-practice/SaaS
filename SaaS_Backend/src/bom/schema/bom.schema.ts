import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import { Document, Types } from 'mongoose';
import { type } from 'os';

@Schema({ timestamps: true })
export class BoM extends Document {
  @Prop({ type: String })
  entityName: string;
  @Prop({ type: String })
  entityId: string;
  @Prop({ type: String })
  entityTypeId: string;
  @Prop({ type: String })
  description: string;
  @Prop({ type: String })
  createdBy: string;
  @Prop({ type: String })
  parentId: string;

  @Prop({ type: String })
  locationId: string;
  @Prop({ type: Array })
  owners: [JSON];
  @Prop({ type: String })
  category: string;
  @Prop({ type: String })
  familyId: string;
  @Prop({ type: Array })
  childId: [JSON];
  @Prop({ type: String })
  organizationId: string;
  @Prop({ type: JSON })
  picture: Object;
  @Prop({ type: Boolean, default: false })
  deleted: boolean;
}

export const BoMSchema = SchemaFactory.createForClass(BoM);
