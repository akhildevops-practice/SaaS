import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class CIPCategory extends Document {
    @Prop({ type: String })
    organizationId: string;

    @Prop({ type: String })
    categoryName: string;

    @Prop({ type: Array })
    options: [string];
}

export const CIPCategoryDocument = SchemaFactory.createForClass(CIPCategory)