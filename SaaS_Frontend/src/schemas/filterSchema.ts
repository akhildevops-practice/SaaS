interface data {
  businessType: "string";
  business: "string";
  function: "string";
  unit: "string";
  EntityName: "string";
  creatorName: "string";
  systemName: "string";
  documentType: "string";
  startDate: Date | null;
  endDate: Date | null;
}

export const filterSchema: any = {
  businessType: "",
  business: "",
  function: "",
  unit: "",
  EntityName: "",
  creatorName: "",
  systemName: "",
  documentType: "",
  startDate: null,
  endDate: null,
};
