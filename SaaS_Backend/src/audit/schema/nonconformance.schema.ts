import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NonconformanceDocument = Nonconformance & Document;

/**
 * This schema is for NCs , describing all the properties of NC and OBS.
 * NCs and OBS has the same schema, with some properties being set or not.
 */

@Schema({ timestamps: true })
export class Nonconformance {
  @Prop({ type: String })
  id: String;

  @Prop({ type: Date, default: Date.now() })
  date: string;

  @Prop({ type: Types.ObjectId, ref: 'Audit', required: true })
  audit: string;

  @Prop({ type: String })
  creator: string;

  @Prop({ type: String })
  type: string;

  @Prop({type:String})
  auditTypeId:string;

  @Prop({ type: String })
  comment: string;

  @Prop({ type: [Object] })
  clause: [];

  // 0 -> Minor & 1 -> Major
  @Prop({ type: String, default: 'Minor', enum: ['Major', 'Minor', ''] })
  severity: string;

  @Prop({ type: String })
  mainComments: string;
  @Prop({
    type: String,
    default: 'OPEN',
    enum: ['OPEN', 'CLOSED', 'CANCELLED', 'IN_PROGRESS', 'ACCEPTED','NA'],
  })
  status: string;

  @Prop({ type: String })
  questionNumber: string;

  @Prop({ type: Date, default: '' })
  closureDate: String;

  @Prop({ type: String })
  closureRemarks: string;

  @Prop({ type: String })
  auditRequired: string;

  @Prop({ type: String })
  organization: string;

  @Prop({ type: String })
  location: string;

  @Prop({ type: String })
  auditYear: string;

  @Prop({ type: String })
  sendBackComment: string;

  @Prop({ type: String })
  auditedEntity: String;

  @Prop({ type: String })
  document: string;

  @Prop({ type: Array })
  system: [String];

  @Prop({ type: [String] })
  auditors: string[];

  @Prop({ type: [String] })
  auditees: string[];

  @Prop({
    type: [Types.ObjectId],
    ref: 'NcComment',
  })
  ncComments: [];

  @Prop({ type: [Types.ObjectId], ref: 'NcWorkflowHistory' })
  workflowHistory: [];

  @Prop({
    type: {
      date: {
        type: Date,
      },
      proofDocument: [],
      documentName: String,
      comment: String,
      isDraft: {
        type: Boolean,
        default: false,
      },
      correction: { type: String },
      targetDate: {
        type: Date,
      },
      whyAnalysis: {
        type: String,
      },
      actualDate: {
        type: Date,
      },
      actualTargetDate: {
        type: Date,
      },
      actualCorrection: { type: String },
      actualComment: { type: String },
    },
  })
  correctiveAction: any;

  @Prop({
    type: {
      date: {
        type: Date,
      },
      verficationAction: {
        type: String,
      },
      verficationDate: { type: Date },
      comment: String,
      isDraft: {
        type: Boolean,
        default: false,
      },
    },
  })
  auditorReview: any;

  @Prop({ type: String, default: 'AUDITEE' })
  currentlyUnder: String;

  @Prop({ type: Boolean, default: false })
  deleted: Boolean;

  @Prop({ type: Boolean, default: false })
  auditeeAccepted: Boolean;

  @Prop({ type: Boolean, default: false })
  auditorAccepted: Boolean;

  @Prop({ type: Boolean, default: false })
  mrAccepted: Boolean;

  @Prop({ type: Boolean, default: false })
  auditeeRejected: Boolean;

  @Prop({ type: Boolean, default: false })
  mrRejected: Boolean;

  @Prop({ type: String })
  sectionFindingId: String;
}

export const NonconformanceSchema =
  SchemaFactory.createForClass(Nonconformance);
