import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class GlobalWorkflow extends Document {
    @Prop({ type: String })
    organizationId: string;

    @Prop({ type: String })
    title: string;

    @Prop({ type: Array })
    workflow: [object];

}

export const GlobalWorkflowSchema = SchemaFactory.createForClass(GlobalWorkflow)