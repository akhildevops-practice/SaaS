import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document} from 'mongoose';

@Schema({ timestamps: true })
export class topicHelp extends Document {
    @Prop({ type : String})
    moduleId : string

    @Prop({ type : String })
    topic: string;
    
    @Prop({ type : Buffer })
    fileContent: Buffer
}

export const topicHelpDocument = SchemaFactory.createForClass(topicHelp)