/**
 * This is the schema reference for the Risk Configuration Form.
 */

export interface RiskConfigSchema {
  id?: string;
  category: string;
  condition: { name: string }[];
  riskType: { name: string }[];
  impactType: { name: string }[];
  riskCumulativeHeader: any[];
  riskCumulative: any[];
  riskFactorial: any[];
  riskSignificance : any[];
  computationType? : string;
  orgId?: string;
}

export const riskConfig: RiskConfigSchema = {
  id: "",
  category: "",
  condition : [{ name: "" }],
  riskType: [{ name: "" }],
  impactType: [{ name: "" }],
  riskCumulativeHeader: [],
  riskCumulative: [],
  riskFactorial: [],
  riskSignificance: [],
  computationType : "",
  orgId: "",
};

export interface HiraConfigSchema {
  id?: string;
  riskCategory: string;
  condition : { name: string }[];
  riskType: { name: string }[];
  hiraMatrixHeader: any[];
  hiraMatrixData: any[];
 titleLabel : string;
  basicStepLabel : string;
  riskLevelData : any[];
  orgId?: string;
}




export const hiraConfig: HiraConfigSchema = {
  id: "",
  riskCategory: "",
  riskType: [{ name: "" }],
  condition : [{ name: "" }],
  hiraMatrixHeader: [],
  hiraMatrixData: [],
  titleLabel : "",
  basicStepLabel : "",
  riskLevelData: [],    /** sample object of risk level Data ->  
  riskIndicator: string;
  riskIndicatorColor: string;
  riskLevel: string;
} */
  orgId: "",
};

export interface AspectImpactConfigSchema {
  id?: string;
  riskCategory: string;
  
  riskType: { name: string }[];
  condition : { name: string }[];
  interestedParties : { name: string }[];
  hiraMatrixHeader: any[];
  hiraMatrixData: any[];

  riskLevelData : any[];
  orgId?: string;
}




export const aspectImpactConfig: AspectImpactConfigSchema = {
  id: "",
  riskCategory: "",
  riskType: [{ name: "" }],
  condition : [{ name: "" }],
  interestedParties : [{ name: "" }],
  hiraMatrixHeader: [],
  hiraMatrixData: [],
  
  riskLevelData: [],    /** sample object of risk level Data ->  
  riskIndicator: string;
  riskIndicatorColor: string;
  riskLevel: string;
} */
  orgId: "",
};

