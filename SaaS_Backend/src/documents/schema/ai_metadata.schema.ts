import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class aiMetaData extends Document {
    @Prop({ type: String })
    organizationId: string;

    @Prop({ type: String })
    documentId: string;

    
    @Prop({ type: String })
    drawingSummary: "";

    @Prop({ type: Object, required: true })
    metadata: {
        equipment?: string;
        people?: string;
        locations?: string;
        dates?: string;
        references?: string;
        hira?: string;
        aspect?: string;
        systems?: string;
        clauses?: string;
    };

    @Prop({ type: Object, required: true })
    metadataDrawing: {};

    @Prop({type : String})
    docSummary: any;

    @Prop({type : Array})
    docMcq: any;

    @Prop({type : String})
    riskAnalysis: any;
}

export const aiMetaDataSchema = SchemaFactory.createForClass(aiMetaData)