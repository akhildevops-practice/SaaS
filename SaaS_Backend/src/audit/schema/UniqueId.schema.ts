import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type UniqueIdDocument = UniqueId & Document;

/**
 * This schema is to generate unique incremental ID for NC and OBS.
 * 
 * It starts from 1000 and keep on increasing from here and returns a unique ID every time we hit the associated methods.
 */

@Schema()
export class UniqueId {

    @Prop({ type: Number, default: 1000 })
    ncId: Number;

    @Prop({ type: Number, default: 1000 })
    obsId: Number;

    @Prop({ type: Number, default: 1000 })
    ofiId: Number;
}

export const UniqueIdSchema = SchemaFactory.createForClass(UniqueId);