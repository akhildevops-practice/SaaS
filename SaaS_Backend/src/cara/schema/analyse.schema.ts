import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Sub-schema for Is/Is Not Item
@Schema()
class IsIsNotItem {
  @Prop({ type: String })
  question: string;

  @Prop({ type: String })
  answer: string;
}
const IsIsNotItemSchema = SchemaFactory.createForClass(IsIsNotItem);

// Sub-schema for Fishbone Item
@Schema()
class FishboneItem {
  @Prop({ type: Boolean })
  checked: boolean;

  @Prop({ type: String })
  textArea: string;
}
const FishboneItemSchema = SchemaFactory.createForClass(FishboneItem);

// Fishbone Structure with Fixed Categories
@Schema()
class FishboneStructure {
  @Prop({ type: [FishboneItemSchema], default: [] })
  environment: FishboneItem[];

  @Prop({ type: [FishboneItemSchema], default: [] })
  man: FishboneItem[];

  @Prop({ type: [FishboneItemSchema], default: [] })
  machine: FishboneItem[];

  @Prop({ type: [FishboneItemSchema], default: [] })
  method: FishboneItem[];

  @Prop({ type: [FishboneItemSchema], default: [] })
  material: FishboneItem[];

  @Prop({ type: [FishboneItemSchema], default: [] })
  measurement: FishboneItem[];
}
const FishboneStructureSchema = SchemaFactory.createForClass(FishboneStructure);

// Is/Is Not Structure with Fixed Categories
@Schema()
class IsIsNotStructure {
  @Prop({ type: [IsIsNotItemSchema], default: [] })
  what: IsIsNotItem[];

  @Prop({ type: [IsIsNotItemSchema], default: [] })
  why: IsIsNotItem[];

  @Prop({ type: [IsIsNotItemSchema], default: [] })
  where: IsIsNotItem[];

  @Prop({ type: [IsIsNotItemSchema], default: [] })
  when: IsIsNotItem[];

  @Prop({ type: [IsIsNotItemSchema], default: [] })
  howMuch: IsIsNotItem[];

  @Prop({ type: [IsIsNotItemSchema], default: [] })
  howMany: IsIsNotItem[];

  @Prop({ type: [IsIsNotItemSchema], default: [] })
  who: IsIsNotItem[];
}
const IsIsNotStructureSchema = SchemaFactory.createForClass(IsIsNotStructure);

// Root Cause with Fixed Fields
@Schema()
class RootCause {
  @Prop({ type: [], default: [] })
  why1: [JSON];

  @Prop({ type: [String], default: [] })
  why2: [];

  @Prop({ type: [String], default: [] })
  why3: [];

  @Prop({ type: [String], default: [] })
  why4: [];

  @Prop({ type: [String], default: [] })
  why5: [];
}
const RootCauseSchema = SchemaFactory.createForClass(RootCause);

// Main Analyse Schema
@Schema({ timestamps: true })
export class Analyse extends Document {
  @Prop({ type: String, unique: true, required: true })
  capaId: string;

  // Is/Is Not Structure with Fixed Categories
  @Prop({ type: IsIsNotStructureSchema, default: () => ({}) })
  isIsNot: IsIsNotStructure;

  // Fishbone Structure with Fixed Categories
  @Prop({ type: FishboneStructureSchema, default: () => ({}) })
  fishBone: FishboneStructure;

  // Root Cause with Fixed Fields
  @Prop({ type: RootCauseSchema, default: () => ({}) })
  rootCause: RootCause;

  @Prop({ type: Array })
  causes: [JSON];

  @Prop({ type: String, required: true })
  organizationId: string;

  @Prop({ type: String, required: true })
  createdBy: string;

  @Prop({ type: String })
  updatedBy: string;
}

export const AnalyseSchema = SchemaFactory.createForClass(Analyse);
