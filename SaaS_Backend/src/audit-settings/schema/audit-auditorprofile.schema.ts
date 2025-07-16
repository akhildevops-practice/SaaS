import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class AuditorProfile extends Document {
  // @Prop({ type: String })
  // auditorName: string;
  @Prop({ type: Array })
  auditorName: [object];

  // @Prop({ type: String })
  // unit: string;
  @Prop({ type: Array })
  unit: [object];

  @Prop({ type: Array })
  systemExpertise: string[];

  @Prop({ type: Array })
  functionalProficiency: string[];

  @Prop({ type: Array })
  allowedAuditTypes: string[];

  @Prop({ type: Array })
  proficiencies: string[];

  @Prop({ type: Array })
  inLead: string[];

  // @Prop({ type: Array })
  // certifications: string[];

  @Prop({ type: [Object] })
  certifications: any[];

  @Prop({ type: String })
  organizationId: string;

  @Prop({ type: Array })
  functionproficiencies: string[];

  @Prop({ type: [Object] })
  auditType: any[];
}

export const AuditorProfileSchema =
  SchemaFactory.createForClass(AuditorProfile);
