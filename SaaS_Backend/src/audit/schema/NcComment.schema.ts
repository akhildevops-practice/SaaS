
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type NcCommentDocument = NcComment & Document;

/**
 * This schema is for Nc Comments provided by MR.
 * Every comments written by any MR is push down to the NC comment.
 * We have a seperate collection for for storing nccomments.
 */

@Schema({ timestamps: true })
export class NcComment {

    @Prop({ type: Types.ObjectId, ref: "Nonconformance", required: true})
    nc: string;

    @Prop({ type: String })
    comment: string;

    @Prop({ type: String, required: true })
    user: string

}

export const NcCommentSchema = SchemaFactory.createForClass(NcComment);