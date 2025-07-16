// interface data {
//   id: string;
//   auditType: string;
//   Description: string;
//   organizationId: string;
// }

// export interface AuditTypeData {
//   id: string;
//   auditType: string;
//   scope: string;
//   responsibility: string;
//   Description: string;
//   organizationId: string;
//   AutoAcceptNC: number;
//   ClosureRemindertoDeptHead: number;
//   ClosureRemindertoMCOE: number;
//   VerificationOwner: "NONE" | "IMSC" | "MCOE"; // Assuming a specific set of values
//   AuditeeReminder: number;
//   EscalationtoDepartmentHead: number;
//   EscalationtoMCOE: number;
// }

export const auditTypeData = {
  id: "",
  auditType: "",
  auditTypeId: "",
  scope: "",
  responsibility: "",
  planType: "Month",
  Description: "",
  resolutionWorkFlow:"",
  auditorCheck: false,
  allowConsecutive: false,
  auditorsFromSameUnit: false,
  auditorsFromSameDept: false,
  inductionApproval: false,
  useFunctionsForPlanning:false,
  multipleEntityAudit:false,
  organizationId: "",
  system:[],
  AutoAcceptNC: 0,
  ClosureRemindertoDeptHead: 0,
  ClosureRemindertoMCOE: 0,
  VerificationOwner: "NONE",
  AuditeeReminder: 0,
  EscalationtoDepartmentHead: 0,
  EscalationtoMCOE: 0,
  whoCanPlan: "",
  whoCanSchedule: "",
  planningUnit: [],
  planningEntity: {},
  schedulingEntity: {},
  schedulingUnit: [],
  maxSections: "",
  auditTimeFrame: "",
  noOfSopQuestions: "",
  noOfFindingsQuestions: "",
  noOfOperationQuestions: "",
  noOfHiraQuestions: "",
  noOfAspImpQuestions: "",
};
