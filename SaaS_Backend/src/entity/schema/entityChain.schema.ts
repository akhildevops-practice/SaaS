import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class EntityChain extends Document {
  @Prop({ type: String, required: true })
  parentId: string;

  @Prop({ type: String, required: true })
  childId: string;

  @Prop({ type: Number, required: true })
  depth: number; // 0 = self, 1 = direct child, 2 = grandchild

  @Prop({ type: String })
  organizationId?: string;

  @Prop({ type: String })
  createdBy?: string;

  @Prop({ type: String })
  updatedBy?: string;
}

export const EntityChainSchema =
  SchemaFactory.createForClass(EntityChain);
