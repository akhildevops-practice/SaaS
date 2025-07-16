import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class CIPDocumentComments extends Document {
    @Prop({ type: String })
    organizationId: string;

    @Prop({ type: String })
    cipId: string;

    @Prop({ type: String })
    userId: string;

    @Prop({ type: String })
    commentBy: string;

    @Prop({ type: String })
    commentText: string;
}

export const CIPDocumentCommentsDocument = SchemaFactory.createForClass(CIPDocumentComments)