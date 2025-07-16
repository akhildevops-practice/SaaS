interface data {
  location: "string";
  businessUnit: "string";
  entity: "string";
  kpiName: "string";
  uom: "string";
  minDate: Date | null;
  maxDate: Date | null;
  displayBy: "string";
  targetType: "boolean";
}

export const kpiReport: any = {
  location: "",
  businessUnit: "",
  entity: "",
  kpiName: "",
  uom: "",
  minDate: new Date(),
  maxDate: new Date(),
  displayBy: "Days",
  targetType: "",
};
