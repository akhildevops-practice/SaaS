import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class CIPActionItems extends Document {
    @Prop({ type: String })
    organizationId: string;
    
    @Prop({ type : String})
    cipId : string

    @Prop({ type : String})
    actionItem : string

    @Prop({ type : String})
    description : string

    @Prop({ type : Object})
    owner : object

    @Prop({ type : Date})
    startDate : Date

    @Prop({ type : Date})
    targetDate : Date

    @Prop({ type : String})
    status : string

    @Prop({ type: Array })
    attachments: [Object];

    @Prop({ type: Array })
    activityUpdate: [Object];
}

export const CIPActionItemsDocument = SchemaFactory.createForClass(CIPActionItems)