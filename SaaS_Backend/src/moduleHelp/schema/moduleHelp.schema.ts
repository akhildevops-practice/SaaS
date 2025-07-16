import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document} from 'mongoose';

@Schema({ timestamps: true })
export class moduleHelp extends Document {
    @Prop({ type: String })
    module: string;
    
    @Prop({ type: Array })
    topicOrder: string[]
}

export const moduleHelpDocument = SchemaFactory.createForClass(moduleHelp)