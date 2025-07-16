const t = new Date();
const dd = String(t.getDate()).padStart(2, "0");
const mm = String(t.getMonth() + 1).padStart(2, "0");
const yyyy = t.getFullYear();
const today: string = dd + "/" + mm + "/" + yyyy;

interface data {
  Year: string;
  ObjectiveCategory: string;
  ModifiedBy: string;
  createdAt: any;
  updatedAt: any;
  Description: string;
  _id: string;
}

export const objectiveGoalsForm: data = {
  Year: "",
  ObjectiveCategory: "",
  ModifiedBy: "User",
  createdAt: today,
  updatedAt: "",
  Description: "",
  _id: "",
};
