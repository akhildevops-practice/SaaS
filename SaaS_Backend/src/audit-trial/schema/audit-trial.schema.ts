import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class auditTrail extends Document {
    @Prop({ type: String })
    organizationId: string;

    @Prop({ type: String })
    responsibleUser: string;

    @Prop({ type: Date })
    timestamp: Date;

    @Prop({ type: String })
    actionType: string;

    @Prop({ type: String })
    module: string;

    @Prop({ type: String })
    subModule: string;

    @Prop({ type: String })
    subModuleId: string;

    @Prop({ type: Object })
    beforeState: object

    @Prop({ type: Object })
    afterState: object
}

export const auditTrailDocument = SchemaFactory.createForClass(auditTrail)