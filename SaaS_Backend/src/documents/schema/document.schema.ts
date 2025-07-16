import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';

@Schema({ timestamps: true })
export class Documents extends Document {
  //to store the doctypeid
  @Prop({ type: String })
  doctypeId?: string;
  //to store doc id of the parent to maintain version
  @Prop({ type: String })
  documentId?: string;
  //std to store org id
  @Prop({ type: String })
  organizationId?: string;
  //to store doc name
  @Prop({ type: String })
  documentName?: string;
  //serial number for a doc
  @Prop({ type: String })
  documentNumbering?: string;
  //reason why doc was created
  @Prop({ type: String })
  reasonOfCreation?: string;
  //date when the document is published and becomes effective
  @Prop({ type: Date })
  effectiveDate?: Date;
  //date when the doc is due for revision computed based on revision frequency from doctype,effectiveDate as the base for cal
  @Prop({ type: Date })
  nextRevisionDate?: Date;
  //version of the doc when published
  @Prop({ type: String })
  currentVersion?: string;
  //to store url either obj store or local
  @Prop({ type: String })
  documentLink?: string;

  //to capture the status-Draft,In Review,In approval,published,Retire,Obsolete

  @Prop({ type: String })
  documentState?: string;
  //to store location and it si mandatory each doc is associated with location
  @Prop({ type: String, required: true })
  locationId: string;
  //to store dept
  @Prop({ type: String })
  entityId?: string;
  //to store different systems this doc is associated with, multiple
  @Prop({ type: [String], default: [] })
  system: string[];
  //to store section associated with
  @Prop({ type: String })
  section?: string;
  //to store why retire was reverted
  @Prop({ type: String })
  revertComment?: string;

  //issue number
  @Prop({ type: String })
  issueNumber?: string;
  //to capture why doc was retired
  @Prop({ type: String })
  retireComment?: string;
  //a reminder set for revision due
  @Prop({ type: Boolean })
  revisionReminderFlag?: boolean;
  //current version
  @Prop({ type: Boolean })
  isVersion?: boolean;
  //when the doc was approved
  @Prop({ type: Date })
  approvedDate?: Date;

  @Prop({ type: Number })
  countNumber?: number;
  //doc creator id
  @Prop({ type: String })
  createdBy?: string;

  @Prop({ type: String })
  updatedBy?: string;
  //to who and all the doc needs to be distributed

  //to store for which userids this is favorite
  @Prop({ type: [String], default: [] })
  favoriteFor: string[];

  //array of reviewers ids
  //creator,reviewer,approver ids are required only for default workflow, once workflow is integrated we might have to remove these fields
  @Prop({ type: [String], default: [] })
  reviewers: string[];
  //array of approvers ids
  @Prop({ type: [String], default: [] })
  approvers: string[];


  @Prop({ type: Object })
  distributionList: {
    type: string;
    ids: string[];
  };
  @Prop({ type: Object })
  readAccess: {
    type: string;
    ids: string[];
  };

  //info related to version
  @Prop({ type: [SchemaTypes.Mixed], default: [] })
  versionInfo: any[];

  @Prop({ type: Object, default: "default"  })
  workflowDetails: any;
}

export const DocumentsSchema = SchemaFactory.createForClass(Documents);
