import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AuditDocument = Audit & Document;

/**
 * This schema is for audit entry form
 * It describes all the properties for any audit
 * Audits are stored in a seperate collection in the database
 */

@Schema({ timestamps: true })
export class Audit {
  @Prop({ type: Boolean, default: true })
  isDraft: boolean;

  @Prop({ type: String })
  auditName: string;

  @Prop({ type: String })
  auditNumber: string;

  @Prop({ type: String }) // audit type or system type
  auditType: string;

  @Prop({ type: Array })
  system: [String];

  @Prop({ type: Date })
  date: string;

  @Prop({ type: Date })
  scheduleDate: string;

  @Prop({ type: String })
  organization: string;

  @Prop({ type: String })
  location: string;

  @Prop({ type: String })
  auditYear: string;

  @Prop({ type: Array })
  selectedTemplates: [];

  @Prop({ type: [String] })
  auditors: string[];

  @Prop({ type: [String] })
  auditees: string[];

  @Prop({ type: String })
  goodPractices: string;
  @Prop({ type: String })
  comment: string;

  @Prop({ type: String })
  status: boolean;

  @Prop({ type: String })
  auditScheduleId: string;
  // @Prop({ type: [String] })
  // urls: string[];

  @Prop({ type: [Object] })
  urls: any[];

  // @Prop({
  //   title: {
  //     type: String,
  //   },
  //   fieldset: [
  //     {
  //       id: String,
  //       title: String,
  //       inputType: String,
  //       options: [
  //         {
  //           name: {
  //             type: String,
  //           },
  //           value: {
  //             type: Number,
  //           },
  //           checked: {
  //             type: Boolean,
  //           },
  //         },
  //       ],
  //       questionScore: Number,
  //       score: [
  //         {
  //           name: {
  //             type: String,
  //           },
  //           value: {
  //             type: Number,
  //           },
  //           score: {
  //             type: Number,
  //           },
  //         },
  //       ],
  //       required: {
  //         type: Boolean,
  //       },
  //       allowImageUpload: Boolean,
  //       value: String,
  //       hint: String,
  //       slider: Boolean,
  //       open: Boolean,
  //       image: String,
  //       imageName: String,
  //       nc: {
  //         type: Types.ObjectId,
  //         ref: 'Nonconformance',
  //       },
  //     },
  //   ],
  // })
  @Prop({ type: [Object] })
  sections: any[];

  @Prop({ type: Number })
  totalScore: Number;

  @Prop({ type: String })
  auditedEntity: String;

  @Prop({ type: String })
  auditObjective: String;

  @Prop({ type: [Object] })
  auditedClauses: any[];

  @Prop({ type: [String] })
  auditedDocuments: string[];

  @Prop({ type: Boolean, default: false })
  deleted: Boolean;

  @Prop({ type: String })
  createdBy: String;

  @Prop({ type: String })
  updatedBy: String;

  @Prop({ type: Array })
  sop_refs: [];

  @Prop({ type: Array })
  hira_refs: [];

  @Prop({ type: Array })
  capa_refs: [];

  @Prop({ type: String })
  auditScope: String;
}

export const AuditSchema = SchemaFactory.createForClass(Audit);
