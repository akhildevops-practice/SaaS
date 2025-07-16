import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class CIPOrigin extends Document {
    @Prop({ type: String })
    organizationId: string;

    @Prop({ type: String })
    originName: string;

    @Prop({ type: Array })
    options: [string];

    @Prop({ type: Object })
    location: object;
}

export const CIPOriginDocument = SchemaFactory.createForClass(CIPOrigin)