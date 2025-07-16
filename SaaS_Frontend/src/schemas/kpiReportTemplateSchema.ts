import { dateToLongDateFormat } from "../utils/dateFormat";

/**
 * This is the schema reference for the KPI report template form.
 */

export interface IKpiReportTemplateCategorySchema {
  kpi: { label: string; value: string };
  kpiTargetType: string;
  kpiName: string;
  description: string;
  uom: string;
  value: string;
  comments: string;
  kpiTarget: string;
  minimumTarget: string;
  weightage: string;
  variance: string;
  score: string;
  monthlyAvg: string;
  annualAvg: string;
  mtd: string;
  ytd: string;
  ratio: string;
}
export interface IKpiReportTemplateSchema {
  location: string;
  sources: string[];
  active: boolean;
  kpiReportTemplateName: string;
  reportFrequency: string;
  schedule: string;
  updatedBy: string;
  updatedAt: string;
  readersLevel: string;
  reportReaders: string[];
  emailRecipients: string[];
  reportEditors: string[];

  businessUnitFieldName: string;
  entityFieldName: string;

  categories: {
    catId: string;
    catName: string;
    columnsArray: string[];
    catData: IKpiReportTemplateCategorySchema[];
  }[];
}

export const kpiReportTemplateSchema: IKpiReportTemplateSchema = {
  location: "",
  sources: [],
  active: false,
  kpiReportTemplateName: "",
  reportFrequency: "",
  schedule: "",
  updatedBy: "",
  updatedAt: dateToLongDateFormat(new Date()),
  readersLevel: "",
  reportReaders: [],
  emailRecipients: [],
  reportEditors: [],

  businessUnitFieldName: "",
  entityFieldName: "",

  categories: [],
};
