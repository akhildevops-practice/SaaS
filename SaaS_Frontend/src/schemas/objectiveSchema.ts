/**
 * This is the schema reference for the objective Form.
 */

const t = new Date();
const dd = String(t.getDate()).padStart(2, "0");
const mm = String(t.getMonth() + 1).padStart(2, "0");
const yyyy = t.getFullYear();
const today: string = dd + "/" + mm + "/" + yyyy;

interface data {
  _id: string;
  ObjectiveName: string;
  // Year: string;
  ObjectiveId: string;
  // ObjectiveCategory: [];
  Description: string;
  ModifiedDate: any;
  ModifiedBy: string;
  ReviewList: string[];
  ObjectivePeriod: string;
  EntityTypeId: string;
  ObjectiveType: string;
  ObjectiveLinkedId: string[];
  ObjectiveStatus: boolean;
  MilestonePeriod: string;
  ParentObjective: string;
  createdAt: any;
  updatedAt: any;
  ReviewComments: any;
  Readers: string;
  Owner: any;
  ReadersList: string[];
  OwnerShipType: any;
  OwnershipEntity: any;
  userId: string;
  Reason: string;
  ownerComments: string;
  reviewComments: string;
  OwnerName: any;
  ReaderAccess: boolean;
  ReviwerAccess: boolean;
  EditerAccess: boolean;
  // __v: any;
  // NClink: string;
  // NCId: string;
  // Observlink: string;
  // ObservId: string;
}

export const objectiveSchema: data = {
  _id: "",
  ObjectiveName: "",
  // Year: "",
  ObjectiveId: "",
  // ObjectiveCategory: [],
  Description: "",
  ModifiedDate: today,
  ModifiedBy: "",
  ReviewList: [],
  ObjectivePeriod: "",
  EntityTypeId: "",
  ObjectiveType: "Organization Goals",
  ObjectiveLinkedId: [],
  ObjectiveStatus: true,
  MilestonePeriod: "",
  ParentObjective: "",
  createdAt: today,
  updatedAt: today,
  ReviewComments: "",
  Readers: "",
  Owner: "",
  OwnerName: "",
  ReaderAccess: false,
  ReviwerAccess: false,
  EditerAccess: false,
  ReadersList: [],
  OwnerShipType: "",
  OwnershipEntity: "",
  userId: "",
  Reason: "",
  ownerComments: "",
  reviewComments: "",
  // __v: 0,
  // NClink: "",
  // NCId: "",
  // Observlink: "",
  // ObservId: "",
};
