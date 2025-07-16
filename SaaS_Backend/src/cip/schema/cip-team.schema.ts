import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class CIPTeam extends Document {
    @Prop({ type: String })
    organizationId: string;

    @Prop({ type: String })
    teamNo: string;

    @Prop({ type: String })
    teamName: string;

    @Prop({ type: String })
    location: string;
}

export const CIPTeamDocument = SchemaFactory.createForClass(CIPTeam)