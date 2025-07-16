/**
 * This is the schema reference for the Audit Plan Form.
 */

const t = new Date();
const dd = String(t.getDate()).padStart(2, "0");
const mm = String(t.getMonth() + 1).padStart(2, "0");
const yyyy = t.getFullYear();
const today: string = dd + "/" + mm + "/" + yyyy;

interface IAuditPlanEntitywise {
  [key: string]: any;
}

export const auditPlanSchema = {
  auditName: "",
  year: "",
  status: "active",
  location: { id: "", locationName: "" },
  createdBy: "",
  createdOn: today,
  lastModified: today,
  systemType: "",
  locationId: "",
  auditType: "",
  isDraft:true,
  planType: "",
  systemName: [],
  scope: { id: "", name: "" },
  checkOn: false,
  // responsibility: "",
  role: "",
  auditorCheck: "",
  comments: "",
  AuditPlanEntitywise: <IAuditPlanEntitywise[]>[],
  useFunctionsForPlanning:false,
  prefixSuffix: "",
  auditPlanId : "",
  auditTypeName : "",
};
