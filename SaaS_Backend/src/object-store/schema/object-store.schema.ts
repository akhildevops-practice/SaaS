import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ObjectStore extends Document {
  @Prop({ type: String })
  organizationId: string;

  @Prop({ type: String })
  userId: string;

  @Prop({ type: String })
  tenancyId: string;

  @Prop({ type: String })
  fingerprint: string;

  @Prop({ type: String })
  region: string;

  @Prop({ type: Buffer })
  privateKey: Buffer;

  @Prop({ type: String })
  namespace: string;

  @Prop({ type: String })
  bucketName: string;   
}

export const ObjectStoreDocument =
  SchemaFactory.createForClass(ObjectStore);