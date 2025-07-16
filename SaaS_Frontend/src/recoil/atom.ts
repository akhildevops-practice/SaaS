import { atom } from "recoil";
import { locForm } from "../schemas/locForm";
import { orgForm } from "../schemas/orgForm";
import { userForm } from "../schemas/userForm";
import { deptForm } from "../schemas/deptForm";
import { docTypeForm } from "../schemas/docTypeForm";
import { processDocForm } from "../schemas/processDocForm";
import { notificationSchema } from "../schemas/notifications";
import { navActiveCheck } from "../utils/navActiveCheck";
import { formSchema } from "../schemas/formSchema";
import { systemDetailForm } from "../schemas/systemDetailForm";
import { clauseSchema } from "../schemas/clauseSchema";
import { auditInfo } from "../schemas/auditInfo";
import { minutesOfMeetingForm } from "schemas/minutesOfMeetingNpd";
import {
  auditCreationSchema,
  // cipCreationSchema,
} from "../schemas/auditCreationSchema";
import { mrCommentsSchema, workflowHistorySchema } from "../schemas/ncSummary";
import { observationSchema } from "../schemas/observationSchema";
import { auditeeSectionSchema } from "../schemas/auditeeSectionSchema";
import { auditPlanSchema } from "../schemas/auditPlanSchema";
import { auditScheduleSchema } from "../schemas/auditScheduleSchema";
import { objectiveGoalsForm } from "../schemas/objectiveGoalsForm";
import { objectiveSchema } from "../schemas/objectiveSchema";
import { objectiveForm } from "../schemas/objectiveForm";
import { kpiReport } from "../schemas/kpiReport";
import { kraReport } from "../schemas/kraReport";
import { filterSchema } from "../schemas/filterSchema";
import { documentDrawerData } from "../schemas/documentSchema";
import { graphInfo } from "../schemas/graphSchema";
import { auditTypeData } from "../schemas/auditTypeData";
import { auditFocusArea } from "../schemas/auditFocusArea";
import { auditorProfileSchema } from "../schemas/auditorProfileSchema";
import { npdForm } from "schemas/npdSchema";
import { IModule } from "schemas/globalSearchModuleSchema";
import { proficiency } from "schemas/proficiency";
import { addFieldSchema } from "schemas/addFieldSchema";
import { findingsSchema } from "schemas/findingsSchema";
import { findingsValuesSchema } from "schemas/findingsValuesSchema";
import { expandMeetingSchema } from "schemas/expandMeetingSchema";
import { expandMeetingAgenda } from "schemas/expandMeetingAgendaData";
import { benefitSchema } from "schemas/benefitSchema";
import { actionItemSchema } from "schemas/actionItemSchema";
import { activityUpdateSchema } from "schemas/activityUpdateSchema";
import { cipCategorySchema } from "schemas/cipCategorySchema";
import { modelsForm } from "schemas/modelsForm";
import { cipOriginSchema } from "schemas/cipOriginSchema";
import { cipTypeSchema } from "schemas/cipTypeSchema";
import { cipFormSchema } from "schemas/cipFormSchema";
import { expandMeetingEdit } from "schemas/expandMeetingEditData";
import { expandMeetingDataStore } from "schemas/expandCreateMeetingData";
import { cipActionSchema } from "schemas/cipActionSchema";
import { deviationTypeSchema } from "schemas/deviationTypeSchema";
import { partsForm } from "schemas/partsForm";
import { problemsForm } from "schemas/problemsForm";
import { CIPTableData } from "schemas/cipTableData";
import { CIPTableFormSchema } from "schemas/cipTableFormSchema";
import { CapaActionSchema } from "schemas/capaActionItemSchema";
import { capaActionItemTableData } from "schemas/capaActionItemTableData";
import { CapaOwnerChangeSchema } from "schemas/capaOwnerSchema";
import { defectTypeSchema } from "schemas/defectType.schema";
import type { UploadFile } from "antd/es/upload/interface";

export const moduleNamesAtom = atom<IModule[]>({
  key: "moduleNamesAtom",
  default: [],
});

export const globalSearchClausesResult = atom<any[]>({
  key: "globalSearchClausesResultAtom",
  default: [],
});

export const globalSearchDocumentsResult = atom<any[]>({
  key: "globalSearchDocumentsResultAtom",
  default: [],
});

export const referencesData = atom<any[]>({
  key: "referencesData",
  default: [],
});

export const activeModulesAtom = atom({
  key: "activeModulesAtom",
  default: [] as string[],
});

export const graphData = atom({
  key: "graphData",
  default: graphInfo,
});

export const drawerData = atom({
  key: "drawerData",
  default: documentDrawerData,
});
export const caraRegistrationForm = atom({
  key: "caraRegistrationForm",
  default: {
    title: "",
    comments: "",
    referenceAttachments: <any>[],
    kpiId: "",
    type: "",
    startDate: "",
    entity: "",
    location: "",
    containmentAction: "",
    systems: [],
    analysisLevel: "",

    files: [],
    endDate: "",
    registeredBy: "",
    status: "",
    caraOwner: {},
    caraCoordinator: "",
    coordinator: "",
    serialNumber: "",
    entityId: "",
    systemId: [],
    origin: "",
    locationId: "",
    organizationId: "",
    deptHead: [],
    description: "",
    date: {},
    year: "",
    attachments: [],
    registerfiles: [],
    correctiveAction: "",
    targetDate: "",
    correctedDate: "",
    kpiReportLink: "",
    rootCauseAnalysis: "",
    actualCorrectiveAction: "",
    man: "",
    machine: "",
    environment: "",
    material: "",
    method: "",
    measurement: "",
    why1: "",
    why2: "",
    why3: "",
    why4: "",
    why5: "",
    impact: [],
    impactType: "",
    highPriority: false,
    referenceComments: "",
  },
});
export const navbarColorAtom = atom({
  key: "navbarColorAtom", // unique ID (with respect to other atoms/selectors)
  default: "#0E0A42", // default value (aka initial value)
});
export const npdFormData = atom({
  key: "npdFormData",
  default: npdForm,
});
export const MinutesOfMeetingNpdState = atom({
  key: "MinutesOfMeetingNpdState",
  default: minutesOfMeetingForm,
});

export const MinutesOfMeetingNpdDataState = atom({
  key: "MinutesOfMeetingNpdDataState",
  default: [] as any[],
});

/**
 * This Atom state is required to check if the current viewing device is a mobile or Laptop
 */
export const mobileView = atom({
  key: "mobileView",
  default: false,
});

/**
 * This Atom is required to store data from the Forms of Organization Creation
 */
export const orgFormData = atom({
  key: "orgFormData",
  default: orgForm,
});

export const auditFormData = atom({
  key: "auditFormData",
  default: auditInfo,
});

/**
 * This Atom keeps the orgAdmin count in a Organization.
 */
export const orgAdminCount = atom({
  key: "orgAdminCount",
  default: 0,
});

export const locFormData = atom({
  key: "locFormData",
  default: locForm,
});
export const problemsFormData = atom({
  key: "problemsFormData",
  default: problemsForm,
});
export const objectiveData = atom({
  key: "objectiveData",
  default: objectiveGoalsForm,
});

export const userFormData = atom({
  key: "userFormData",
  default: userForm,
});

export const deptFormData = atom({
  key: "deptFormData",
  default: deptForm,
});

export const systemDetailFormData = atom({
  key: "systemDetailFormData",
  default: systemDetailForm,
});

export const clauseData = atom({
  key: "clauseDetailFormData",
  default: clauseSchema,
});

export const benefitData = atom({
  key: "benefitDetailFormData",
  default: benefitSchema,
});

export const activityUpdateData = atom({
  key: "activityUpdateDetailFormData",
  default: activityUpdateSchema,
});

export const modelsFormData = atom({
  key: "modelsFormData",
  default: modelsForm,
});
export const actionItemData = atom({
  key: "actionItemDetailFormData",
  default: actionItemSchema,
});

export const documentTypeFormData = atom({
  key: "documentTypeFormData",
  default: docTypeForm,
});

export const ObjectiveType = atom({
  key: "ObjectiveType",
  default: objectiveForm,
});

export const processDocFormData = atom({
  key: "processDocFormData",
  default: processDocForm,
});

export const notificationData = atom({
  key: "notificationData",
  default: notificationSchema,
});

export const expandNav = atom({
  key: "expandNav",
  default: false,
});

export const tab = atom({
  key: "tab",
  default: navActiveCheck(),
});

export const currentOrg = atom({
  key: "currentOrg",
  default: "",
});
export const templateForm = atom({
  key: "templateForm",
  default: formSchema,
});

export const auditCreationForm = atom({
  key: "auditCreationForm",
  default: auditCreationSchema,
});
export const avatarUrl = atom({
  key: "avatarUrl",
  default: "",
});

export const questionFocus = atom({
  key: "questionFocus",
  default: false,
});

export const currentLocation = atom({
  key: "currentLocation",
  default: "",
});
export const partsFormData = atom({
  key: "partsFormData",
  default: partsForm,
});
export const currentAuditYear = atom({
  key: "currentAuditYear",
  default: "",
});

export const currentAuditPlanYear = atom({
  key: "currentAuditPlanYear",
  default: "",
});

export const tempClauses = atom({
  key: "currentClauses",
  default: [],
});

export const formStepperError = atom({
  key: "formStepperError",
  default: false,
});

export const closureClause = atom({
  key: "closureClause",
  default: [],
});

export const observationData = atom({
  key: "observationData",
  default: observationSchema,
});

export const auditeeSectionData = atom({
  key: "auditeeSectionData",
  default: auditeeSectionSchema,
});

export const ncsForm = atom({
  key: "ncsForm",
  default: {
    auditName: "",
    auditDateTime: "",
    auditType: "",
    auditNumber: "",
    auditee: [],
    auditor: [],
    entity: "",
    location: "",
    ncDate: "",
    ncNumber: "",
    status:"",
    auditReportId: "",
    clauseAffected: "",
    documentProof: "",
    ncDetails: "",
    auditTypeId: "",
    mrComments: [] as mrCommentsSchema[],
    closureDate: "",
    reviewDate: "",
    caDate: "",
    type: "",
    // findingData:{},
    corrective: false,
    sendBackComment: "",
    auditorSection: false,
    closureSection: false,
    closureBy: "",
    rejectComment: "",
    workflowHistory: [] as workflowHistorySchema[],
  },
});

export const auditPlan = atom({
  key: "auditPlan",
  default: auditPlanSchema,
});

export const auditSchedule = atom({
  key: "auditSchedule",
  default: auditScheduleSchema,
});

export const objective = atom({
  key: "objective",
  default: objectiveSchema,
});

export const kpiChart = atom({
  key: "kpiChart",
  default: kpiReport,
});

export const kraChart = atom({
  key: "kraChart",
  default: kraReport,
});

export const filterFields = atom({
  key: "filterFields",
  default: filterSchema,
});

export const auditTypesFormData = atom({
  key: "auditTypesFormData",
  default: auditTypeData,
});

export const auditFocusAreaData = atom({
  key: "auditFocusAreaData",
  default: auditFocusArea,
});

export const proficiencyData = atom({
  key: "proficiencyData",
  default: proficiency,
});

export const deviationTypeData = atom({
  key: "deviationTypeData",
  default: deviationTypeSchema,
});
export const defectTypeData = atom({
  key: "defectTypeData",
  default: defectTypeSchema,
});

export const auditorProfileData = atom({
  key: "auditorProfileData",
  default: auditorProfileSchema,
});

export const addFieldData = atom({
  key: "addFieldData",
  default: addFieldSchema,
});

export const findingsData = atom({
  key: "findingsDetailFormData",
  default: findingsSchema,
});

export const findingsValuesData = atom({
  key: "findingsValuesFromData",
  default: findingsValuesSchema,
});

export const cipFormData = atom({
  key: "cipFormData",
  default: cipFormSchema,
});

export const cipCategoryData = atom({
  key: "cipCategoryData",
  default: cipCategorySchema,
});

export const cipTypeData = atom({
  key: "cipTypeData",
  default: cipTypeSchema,
});

export const cipOriginData = atom({
  key: "cipOriginData",
  default: cipOriginSchema,
});

export const cipActionItemData = atom({
  key: "cipActionItemData",
  default: cipActionSchema,
});

export const expandMeetingData = atom({
  key: "expandMeetingData",
  default: expandMeetingSchema,
});

export const expandMeetingAgendaData = atom({
  key: "expandMeetingAgendaData",
  default: expandMeetingAgenda,
});

export const expandMeetingEditData = atom({
  key: "expandMeetingEditData",
  default: expandMeetingEdit,
});

export const auditScheduleFormType = atom({
  key: "auditScheduleFormType",
  default: "",
});

export const expandCreateMeeting = atom({
  key: "expandMeetingDataStore",
  default: expandMeetingDataStore,
});

export const cipTableDataState = atom({
  key: "cipTableDataState",
  default: CIPTableData,
});

export const cipTableFormSchemaState = atom({
  key: "cipTableFormSchemaState",
  default: CIPTableFormSchema,
});

export const capaTableFormSchemaState = atom({
  key: "capaTableFormSchemaState",
  default: CapaActionSchema,
});
export const capaOwnerChangeFormSchemaState = atom({
  key: "capaOwnerChangeFormSchemaState",
  default: CapaOwnerChangeSchema,
});

export const capaSubTableDataState = atom({
  key: "capaTableDataState",
  default: capaActionItemTableData,
});

export const helpFormData = atom({
  key: "helpFormData",
  default: [],
});

export const referenceFormData = atom({
  key: "referenceFormData",
  default: [],
});

export const logoFormData = atom<File | null>({
  key: "logoFormData",
  default: null,
});
