export interface ncSummarySchema {
  ncObsId: string;
  comment: string;
  ncDate: string;
  auditName: string;
  clauseNo: string;
  severity: string;
  systemName: string;
  auditor: string;
  status: "OPEN" | "CLOSED" | "CANCELLED" | "DRAFT";
  type: ncSummaryObservationType;
  linkId: string;
}

export enum ncSummaryObservationType {
  NC = "NC",
  Observation = "Observation",
}

export interface mrCommentsSchema {
  commentText: string;
  date: string;
  postedOn: string;
  commentBy: string;
  border: false;
  emptyBackground: true;
}

export interface workflowHistorySchema {
  action: string;
  date: string;
  by: string;
  id: string;
}
