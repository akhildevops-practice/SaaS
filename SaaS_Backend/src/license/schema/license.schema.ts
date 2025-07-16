import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
export type licenseDocument = License & Document;
@Schema({ timestamps: true })
export class License {
  //to store realm id
  @Prop({ type: String })
  organizationId: string;
  @Prop({ type: String })
  createdBy: string;
  @Prop({ type: String })
  updatedBy: string;
  //to store the allowed user count
  @Prop({ type: Number })
  authorizedUsers: number;

  //to store the allowed doc count
  @Prop({ type: Number })
  authorizedDocs: number;

  //to store count of added users count till now(to be computed field)
  @Prop({ type: Number, default: 0 })
  addedUsers: number;

  //to store count of added doc count(to be computed field)
  @Prop({ type: Number, default: 0 })
  addedDocs: number;

  //field to store keys for ai models
  @Prop({ type: String })
  openAiKey: string;
  @Prop({ type: String })
  togetherAIKey: string;
  @Prop({ type: String })
  anthropicKey: string;


  @Prop({ type: String })
  openAiInputTokens: string;
  @Prop({ type: String })
  openAiOutputTokens: string; 

  @Prop({ type: String })
  anthropicInputTokens: string;
  @Prop({ type: String })
  anthropicOutputTokens: string;

  @Prop({ type: String })
  togetherAIInputTokens: string;
  @Prop({ type: String })
  togetherAIOutputTokens: string;



  @Prop({ type: Object, default: {} })
  openaiFeatures: any;
  @Prop({ type: Object, default: {} })
  anthropicFeatures: any;
  @Prop({ type: Object, default: {} })
  togetheraiFeatures: any;

}

export const LicenseSchema = SchemaFactory.createForClass(License);
