export enum Alignment {
  START = "start",
  CENTER = "center",
  END = "end",
}

export enum Position {
  TOP = "top",
  BOTTOM = "bottom",
}

export enum Axis {
  VERTICAL = "x",
  HORIZONTAL = "y",
}

export enum ChartType {
  PIE = "PIE",
  BAR = "BAR",
  LINE = "LINE",
}

export enum ComponentType {
  TEXT = "text",
  CHECKBOX = "checkbox",
  RADIO = "radio",
  NUMERIC = "numeric",
}

export enum InputHandlerType {
  TEXT = "text",
  SLIDER = "slider",
}

export enum OperatorType {
  LT = "<",
  GT = ">",
  EQ = "==",
}

export enum filterFields {
  AUDIT_TYPE = "auditType",
  SYSTEM = "system",
  AUDITED_DOCUMENTS = "auditedDocuments",
  NC_OBS_TYPE = "ncObsType",
  NC_TYPE = "ncType",
  NC_AGE_ANALYSIS = "ncAgeAnalysis",
  TOP_CLAUSES = "topClauses",
  ENTITY_TABLE = "entityInfo",
}

export enum roles {
  MR = "MR",
  ORGADMIN = "ORG-ADMIN",
  AUDITOR = "AUDITOR",
  LOCATIONADMIN = "LOCATION-ADMIN",
  admin = "admin",
  ENTITYHEAD = "ENTITY-HEAD",
  GENERALUSER = "GENERAL-USER",
}

export enum modules {
  AUDIT = "Audit",
  DOCUMENTS = "ProcessDocuments",
  KPI = "Objectives & KPI",
  OBJECTIVES = "Objectives & KPI",
  RISK = "Risk",
  KRA = "KRA",
  MRM = "MRM",
  CAPA = "CAPA",
  CIP = "CIP",
  CLAIM = "CLAIM",
  AI_FEATURES = "AI_FEATURES",
  AUDITCHECKSHEETS = "AuditChecksheets",
  NPD = "NPD",
}

export const newRoles: any = {
  admin: "admin",
  MCOE: "ORG-ADMIN",
  "ORG-ADMIN": "MCOE",
  "LOCATION-ADMIN": "LOCATION-ADMIN",
  IMSC: "MR",
  AUDITEE: "Auditee",
  "Function Spoc": "Function Spoc",

  MR: "IMSC",
  "IMS Coordinator": "MR",
  "ENTITY-HEAD": "ENTITY-HEAD",
  // "PLANT-HEAD": "PLANT-HEAD",
  // "SECTION-HEAD": "SECTION-HEAD",
  "GENERAL-USER": "GENERAL-USER",
  Auditor: "AUDITOR",
  RISK_CONFIG: "RISK_CONFIG",
  AUDITOR: "AUDITOR",
  NONE: "NONE",
  DeptHead: "DeptHead",
  // "PLANT-HEAD": "PLANT-HEAD",
  // "SECTION-HEAD": "SECTION-HEAD",

  RISK_REGISTER: "RISK_REGISTER",
};
