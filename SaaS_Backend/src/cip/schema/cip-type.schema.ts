import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class CIPType extends Document {
    @Prop({ type: String })
    organizationId: string;

    @Prop({ type: String })
    typeName: string;

    @Prop({ type: Array })
    options: [string];

    @Prop({ type: Object })
    location: {
        id : string,
        locationName : string,
    };
}

export const CIPTypeDocument = SchemaFactory.createForClass(CIPType)