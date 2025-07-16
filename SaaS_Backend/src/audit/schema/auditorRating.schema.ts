
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type AuditorRatingDocument = AuditorRating & Document;

/**
 * This schema is for auditor rating.
 * Auditor ratings in being stored in a separate collection. 
 */

@Schema({ timestamps: true })
export class AuditorRating {

    @Prop({ type: Types.ObjectId, ref: "Audit", required: true})
    audit: string;

    @Prop({ type: String })
    user: string;

    @Prop({ type: Number , default: 0 })
    rating : number;
    
    @Prop({ type: String })
    comment: string;
    
    @Prop({ type: String })
    ratedBy: string;


}

export const AuditorRatingSchema = SchemaFactory.createForClass(AuditorRating);