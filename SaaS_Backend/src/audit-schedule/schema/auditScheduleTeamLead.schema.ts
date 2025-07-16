import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
// import { Timestamp } from 'rxjs';

@Schema({ timestamps: true })
export class AuditScheduleTeamLead extends Document {
  @Prop({ type: Types.ObjectId, ref: 'AuditSchedule' })
  auditScheduleId: string;
  @Prop({ type: String })
  teamLeadId: string;
  @Prop({ type: Boolean, default: true })
  pendingForUpdate: Boolean;
}

export const AuditScheduleTeamLeadSchema = SchemaFactory.createForClass(
  AuditScheduleTeamLead,
);
