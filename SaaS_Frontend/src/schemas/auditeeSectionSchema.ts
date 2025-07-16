import moment from "moment";

export const auditeeSectionSchema = {
  date: moment().format("YYYY-MM-DD"),
  targetDate: moment().format("YYYY-MM-DD"),
  correction: "",
  comment: "",
  actualDate: moment().format("YYYY-MM-DD"),
  actualTargetDate: moment().format("YYYY-MM-DD"),
  actualCorrection: "",
  actualComment: "",
  proofDocument: [],
  documentName: "",
  imageName: "",
  imageLink: "",
  isDraft: false,
  whyAnalysis:"",
};
