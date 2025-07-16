interface IUnitForm {
  id: string;
  unitType: string;
  units: string[];
}

export const unitFormSchema: IUnitForm = {
  id: "",
  unitType: "",
  units: [],
};
