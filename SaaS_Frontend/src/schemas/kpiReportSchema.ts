import { dateToLongDateFormat } from "../utils/dateFormat";

/**
 * This is the schema reference for the KPI report form.
 */

export interface IKpiReportCategorySchema {
  kpi: { label: string; value: string };
  kpiTargetType: string;
  kpiId: string;
  kpiName: string;
  description: string;
  uom: string;
  kpiUOM: string;
  kpiDescription: string;
  kpiValue: string;
  kpiComments: string;
  kpiTarget: string;
  minimumTarget: string;
  weightage: string;
  kpiVariance: string;
  kpiScore: string;
  monthlyAvg: string;
  annualAvg: string;
  mtd: string;
  ytd: string;
  ratio: string;
}
export interface IKpiReportSchema {
  yearFor: any;
  location: string;
  entity: string;
  sources: string[];
  active: boolean;
  kpiReportInstanceName: string;
  reportFrequency: string;
  schedule: string;
  updatedBy: string;
  updatedAt: string;
  semiAnnual: string;
  readersLevel: string;
  reportReaders: string[];
  emailRecipients: string[];
  reportEditors: string[];
  year: string;
  runDate: Date;

  businessUnitFieldName: string;
  entityFieldName: string;

  categories: {
    catInfo: any;
    catId: string;
    catName: string;
    columnsArray: string[];
    catData: IKpiReportCategorySchema[];
  }[];
}

export const kpiReportSchema: IKpiReportSchema = {
  location: "",
  entity: "",
  sources: [],
  active: false,
  kpiReportInstanceName: "",
  reportFrequency: "",
  schedule: "",
  updatedBy: "",
  semiAnnual: "",
  updatedAt: dateToLongDateFormat(new Date()),
  readersLevel: "",
  reportReaders: [],
  emailRecipients: [],
  reportEditors: [],
  year: "",
  yearFor: "",
  runDate: new Date(),
  businessUnitFieldName: "",
  entityFieldName: "",

  categories: [],
};
