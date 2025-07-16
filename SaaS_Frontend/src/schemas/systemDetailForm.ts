interface data {
  systemType: string;
  systemName: string;
  description: string;
  location: any[];
  integratedSystems: any[];
  status: boolean;
  // remove later ->
  auditedClauses?: any[];
  auditedDocuments?: any[];
}

export const systemDetailForm: data = {
  systemType: "",
  systemName: "",
  description: "",
  location: [],
  status: false,
  integratedSystems: [],
  // remove later ->
  auditedClauses: [{ name: "test clause" }],
  auditedDocuments: [{ name: "test document" }],
};
