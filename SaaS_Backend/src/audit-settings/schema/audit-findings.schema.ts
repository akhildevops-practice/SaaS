import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class AuditFindings extends Document {
    @Prop({ type: String })
    auditTypeId: string;

    @Prop({ type: String })
    findingType: string;

    @Prop({ type: String })
    findingTypeId: string;

    @Prop({ type: String })
    comments: string;

    @Prop({ type: Boolean })
    selectClause: boolean;

    @Prop({ type: Boolean })
    accept: boolean;

    @Prop({ type: Boolean })
    autoAccept: boolean;

    @Prop({ type: Boolean })
    correctiveAction:boolean;

    @Prop({ type: Boolean })
    auditorVerification: boolean;

    @Prop({ type: Boolean })
    reject: boolean;


    @Prop({ type: Boolean })
    rejected: boolean;

    @Prop({ type: Boolean })
    closure: boolean;

    @Prop({ type: String })
    closureBy: string;

    @Prop({ type: String })
    organizationId: string;
}

export const AuditFindingsSchema = SchemaFactory.createForClass(AuditFindings);
