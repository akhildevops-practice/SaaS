import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class BoMEntity extends Document {
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
  users: [string];
  @Prop({ type: Array })
  familyId: [string];
  @Prop({ type: Array })
  childId: [JSON];
  @Prop({ type: String })
  organizationId: string;
  @Prop({ type: JSON })
  picture: Object;
  @Prop({ type: Boolean, default: false })
  deleted: boolean;
}

export const BoMEntitySchema = SchemaFactory.createForClass(BoMEntity);
