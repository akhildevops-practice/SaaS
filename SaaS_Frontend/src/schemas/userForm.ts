interface data {
  additionalUnits: any;
  id: string;
  realm: string;
  userType: string;
  username: string;
  status: boolean;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  location: {};
  businessType: string;
  entity: {};
  section: string;
  entityId: string;
  locationId: string;
  businessTypeId: string;
  sectionId: string;
  isAction: any;
  assignedRole: any;
  functionId: any;
  roleName: any;
}

export const userForm: data = {
  id: "",
  realm: "",
  additionalUnits: [],
  roleName: "",
  userType: "department",
  username: "",
  status: true,
  firstName: "",
  lastName: "",
  email: "",
  roles: [],
  location: {},
  businessType: "",
  entity: {},
  section: "",
  entityId: "",
  locationId: "",
  businessTypeId: "",
  sectionId: "",
  isAction: "",
  functionId: "",
  assignedRole: [],
};
