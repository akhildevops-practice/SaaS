import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

//export type AuditPlanDocument = AuditPlan & Document;

@Schema({ timestamps: true })
export class GlobalRoles extends Document {
  @Prop({ type: String })
  roleName: string;

  @Prop({ type: Date, default: Date.now() })
  createdAt: Date;

  @Prop({ type: String })
  createdBy: string;

  @Prop({ type: Date, default: Date.now() })
  updatedAt: Date;

  @Prop({ type: String })
  updatedBy: string;

  @Prop({ type: Array })
  assignedTo: [string];

  @Prop({ type: String })
  organizationId: string;

  @Prop({ type: Boolean, default: false })
  deleted: Boolean;
}

export const GlobalRolesSchema = SchemaFactory.createForClass(GlobalRoles);
