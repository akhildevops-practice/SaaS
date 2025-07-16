/**
 * This is the schema reference for the Audit Schedule Form.
 */

const t = new Date();
const dd = String(t.getDate()).padStart(2, "0");
const mm = String(t.getMonth() + 1).padStart(2, "0");
const yyyy = t.getFullYear();
const today: string = dd + "/" + mm + "/" + yyyy;

interface IAuditScheduleEntitywise {
  id?: string;
  entityId: string;
  name: string;
  time: Date | null;
  auditors: string[];
  auditees: string[];
  comments: string;
  areas: string[];
  combinedData: string[];
  auditTemplate: string;
  auditTemplates?: string[];
}

interface IAuditScheduleSchema {
  auditScheduleName: string;
  auditName: string;
  createdBy: string;
  createdOn: string;
  systemType: string;
  systemName: any;
  systems?: any;
  clause_refs?: any;
  clauses?: any;
  sop_refs?: any;
  hira_refs?: any;
  capa_refs?: any;
  auditScope?: any;
  scheduleNumber: string;
  year: string;
  location: { id: string; locationName: "" };
  planNumber: string;
  auditNumber: string;
  scope: { id: string; name: "" };
  role: string;
  minDate: Date | null;
  maxDate: Date | null;
  auditPeriod: string;
  template: string | null;
  auditType: string;
  prefixSuffix: string;
  planType: string;
  AuditScheduleEntitywise: IAuditScheduleEntitywise[];
  isDraft?: any;
  auditTypeName?: string;
  auditTemplates?: any;
  selectedFunction?: any;
  useFunctionsForPlanning?: boolean;
}

export const auditScheduleSchema: IAuditScheduleSchema = {
  auditScheduleName: "",
  auditName: "",
  year: "",
  createdBy: "",
  createdOn: today,
  auditPeriod: "",
  systemType: "",
  systemName: [],
  systems: [{ item: {} }],
  clause_refs: [],
  clauses :[],
  sop_refs: [],
  hira_refs: [],
  capa_refs: [],
  auditScope: "",
  scheduleNumber: "",
  location: { id: "", locationName: "" },
  planNumber: "No plan",
  scope: { id: "", name: "" },
  planType: "",
  role: "",
  auditNumber: "",
  minDate: null,
  maxDate: null,
  template: null,
  auditType: "",
  prefixSuffix: "",
  auditTypeName: "",
  isDraft: false,
  auditTemplates: [],
  selectedFunction: [],
  useFunctionsForPlanning: false,

  AuditScheduleEntitywise: <IAuditScheduleEntitywise[]>[],
};
