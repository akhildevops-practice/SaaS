import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';


@Schema({ timestamps: true })
export class HiraRegister extends Document {

  @Prop({ type: Number, default: 1 })
  sNo: number;

  @Prop({ type: String, default: '1.1' })
  subStepNo: string;
  
  @Prop({ type: String })
  jobTitle: string;

  @Prop({ type: Types.ObjectId, ref: 'HiraConfig' })
  hiraConfigId: string;

  @Prop({ type: String, ref: 'HiraTypeConfig' })
  hazardType: string;

  @Prop({ type: String, ref: 'HiraTypeConfig' })
  impactType: string;

  @Prop({ type: String})
  impactText: string;

  @Prop({ type: String})
  additionalControlMeasure: string;

  @Prop({ type: String})
  responsiblePerson: string;

  @Prop({ type: String})
  implementationStatus: string;

  @Prop({ type: String })
  riskType: string;

  @Prop({ type: String })
  condition: string;

  @Prop({ type: String })
  hazardDescription: string;

  @Prop({ type: String})
  additionalAssesmentTeam: string;

  @Prop({ type: Number, default: 1 })
  preSeverity: number;

  @Prop({ type: Number, default: 1 })
  preProbability: number;

  @Prop({ type: Number, default: 1 })
  postSeverity: number;

  @Prop({ type: Number, default: 1 })
  postProbability: number;


  @Prop({ type: String })
  locationId: string;

  @Prop({type: String})
  jobBasicStep: string;

  @Prop({ type: String })
  existingControl: string;

  @Prop({ type: String })
  entityId: string;

  @Prop({ type: String })
  section: string;

  @Prop({ type: String })
  area: string;

  @Prop({ type: Date })
  closeDate: Date;

  @Prop({ type: String })
  organizationId: string;

  @Prop({ type: Number, default: 0 })
  preMitigationScore: number;

  @Prop({ type: Number, default: 0 })
  postMitigationScore: number;

  @Prop({ type: Array })
  assesmentTeam: [string];

  @Prop({ type: String })
  prefixSuffix: string;

  @Prop({ type: Number, default: 0 })
  revisionNumber : number;

  @Prop({ type: String })
  status: string;

  @Prop({ type: String })
  workflowStatus: string; //newly added 7june , should hold DRAFT, IN_REVIEW, IN_APPROVAL, REJECTED, APPROVED

  @Prop({ type: String })
  createdBy: string;

  @Prop({ type: String })
  updatedBy: string;

  @Prop({ type: Boolean, default: false })
  deleted : boolean

  @Prop({ type: Date, default : null })
  deletedAt : Date
}

export const HiraRegisterSchema = SchemaFactory.createForClass(HiraRegister);


  // @Prop({ type: Array })
  // reviewers: [string];
  
  // @Prop({ type: Array })
  // approvers  : [string];

  // @Prop({ type: Array })
  // attachments  : [];

  
  // @Prop({ type: String })
  // riskImpact: string;

  // @Prop([{ type: String, ref: 'HiraMitigation' }])
  // mitigations: string[];

  // @Prop({
  //   type: [],
  // })
  // preMitigation: [];

    // @Prop({ type: Array })
  // users: [string];

  // @Prop({ type: String })
  // activity: string;

    // @Prop({ type: Array, ref: 'HiraTypeConfig' })
  // hazardTypes: [string];

  // @Prop({ type: Array, ref: 'HiraTypeConfig' })
  // impactTypes: [string];

  // @Prop({ type: Date, default: Date.now })
  // dateOfIdentification: Date;

  // @Prop({ type: String })
  // description: string;
  // @Prop({ type: String })
  // hazardDescription: string; 
  
  // @Prop({ type: Number, default: 0 })
  // significanceScore: number;

    // @Prop({
  //   type: [],
  // })
  // postMitigation: [];