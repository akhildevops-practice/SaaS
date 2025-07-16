interface data {
  location: "string";
  businessUnit: "string";
  entity: "string";
  kraName: "string";
  uom: "string";
  minDate: Date | null;
  maxDate: Date | null;
  displayBy: "string";
  targetType: "boolean";
}

export const kraReport: any = {
  location: "",
  businessUnit: "",
  entity: "",
  kraName: "",
  uom: "",
  minDate: new Date(),
  maxDate: new Date(),
  displayBy: "",
  targetType: "",
};
