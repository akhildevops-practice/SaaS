import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class moduleAdoptionReport extends Document {
    @Prop({ type: String })
    organizationId: string;

    @Prop({ type: String })
    spoc: string;

    @Prop({ type: String })
    locationId: string;

    @Prop({ type : Object})
    documents : object

    @Prop({ type : Object})
    hira : object

    @Prop({ type : Object})
    aspImp : object

    @Prop({ type : Object})
    objAndKpi : object

    @Prop({ type : Object})
    audit : object

    @Prop({ type : Object})
    cip : object

    @Prop({ type : Object})
    capa : object

    @Prop({ type : Object})
    mrm : object
}

export const moduleAdoptionReportDocument = SchemaFactory.createForClass(moduleAdoptionReport)