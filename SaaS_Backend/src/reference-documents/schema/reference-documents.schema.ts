import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class referenceDocuments extends Document {
    @Prop({ type: String })
    organizationId: string;

    @Prop({ type: String })
    topic: string;

    @Prop({ type: Object })
    creator: {
        id: string,
        creatorName: string
    }

    @Prop({ type: Array })
    location: {
        id: string,
        locationId: string,
        locationName: string
    }[]

    @Prop({ type: String })
    documentLink: string;
}

export const referenceDocumentsDocument = SchemaFactory.createForClass(referenceDocuments)