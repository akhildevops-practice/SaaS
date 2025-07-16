import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { v1 as uuidv1 } from 'uuid';

@Schema({ timestamps: true })
export class Organization {
  @Prop({ unique: true, default: () => uuidv1() }) // Use uuidv1() to generate version 1 UUID
  id: string;

  @Prop({ type: String })
  kcId: string;

  @Prop({ type: String })
  organizationName: string;

  @Prop({ type: String })
  realmName: string;

  @Prop({ type: String })
  instanceUrl: string;

  @Prop({ type: String })
  principalGeography: string;

  @Prop({ type: String })
  loginUrl: string;

  @Prop({ type: String })
  logoutUrl: string;

  @Prop({ default: () => new Date() })
  createdAt: string;

  @Prop({ type: String })
  createdBy: string;

  @Prop({ updatedAt: true })
  updatedAt: string;

  @Prop({ type: String })
  updatedBy: string;

  @Prop({ type: [String] })
  activeModules: [string];

  @Prop({ type: String })
  clientID: string;

  @Prop({ type: String })
  clientSecret: string;

  @Prop({ type: String })
  fiscalYearQuarters: string;

  @Prop({ type: String })
  auditYear: string;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
