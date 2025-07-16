import axios from "./axios.global";

/**
 * @method getNcObsSummary
 * @description Get the NC Observation Summary table data
 * @returns {Promise<any>}
 */
export const getNcObsSummary = () => {
  return axios.get("/api/audits/nc/summary");
};

/**
 * @method getNcDetails
 * @description Function to fetch nc details to list them out on nc/observation form
 * @param id {string}
 * @returns nothing
 */
export const getNcDetail = async (id: string) => {
  let result;
  try {
    result = await axios.get(`/api/audits/nc/${id}`);
    return result;
  } catch (error) {}
};

/**
 * @method getNcSummary
 * @description Function to fetch all the nc table data
 * @param skip {number}
 * @param limit {number}
 * @param location {string}
 * @param auditType {string}
 * @param auditor {string}
 * @param system {string}
 * @param clause {string}
 * @param from {string}
 * @param to {string}
 * @returns
 */
export const getNcSummary = async (
  currentyear: string,
  myDept: boolean,
  skip: number,
  limit: number,
  location: string = "",
  auditType: string = "",
  auditor: string = "",
  system: string = "",
  from: string = "",
  to: string = "",
  clause: string = "",
  columnfilterurl?: any,
  sort: string = "",
  type: string = "",
  status: string = "",
  entity: string = "",
  financialYear: string = "",
  auditedentity = "",
) => {
  let result;

  try {
    result = await axios.get(
      `/api/audits/nc/summary/${currentyear}?myDept=${myDept}&skip=${skip}&limit=${limit}&location=${location}&auditType=${auditType}&auditor=${auditor}&system=${system}&from=${from}&to=${to}&clauseNumber=${clause}&sort=${sort}&type=${type}&status=${status}&auditYear=${financialYear}&auditedEntity=${entity}&${columnfilterurl}&auditTypeId=${auditType}`
    );
    return result;
  } catch (error) {}
};
export const getMyNcSummary = async (
  currentyear: string,
  skip: number,
  limit: number,
  location: string = "",
  auditType: string = "",
  auditor: string = "",
  system: string = "",
  from: string = "",
  to: string = "",
  clause: string = "",
  sort: string = "",
  type: string = "",
  status: string = "",
  entity: string = "",
  financialYear: string = "",

  auditedentity = "",
) => {
  let result;
  try {
    result = await axios.get(
      `/api/audits/myncsummary/${currentyear}?skip=${skip}&limit=${limit}&location=${location}&auditType=${auditType}&auditor=${auditor}&system=${system}&from=${from}&to=${to}&clauseNumber=${clause}&sort=${sort}&type=${type}&status=${status}&auditYear=${financialYear}&auditedEntity=${entity}`
    );
    return result;
  } catch (error) {}
};
/**
 * @method postNcsComment
 * @description Function to post a comment
 * @param id string
 * @param comment {string}
 * @returns a successful or failed response
 */
export const postNcsComment = (id: string, comment: string) => {
  return axios.post(`/api/audits/nc/${id}/comments`, { comment });
};

/**
 * @method submitObservation
 * @description Function to submit observation data
 * @param id string
 * @param payload any
 * @returns a successful or failed response
 */
export const submitObservation = async (id: string, payload: any) => {
  let result;
  try {
    result = await axios.post(`/api/audits/obs/${id}/submit`, payload);
    return result;
  } catch (error: any) {}
};

/**
 * @method acceptNc
 * @description Function to accept NC
 * @param id string
 * @param payload any
 * @returns accepted nc as payload
 */
export const acceptNc = async (id: string, payload: any, save: any) => {
  let result;
  try {
    result = await axios.post(`/api/audits/nc/${id}/accept`, {
      ...payload,
      save,
    });
    return result;
  } catch (error) {}
};

/**
 * @method rejectNc
 * @param id string
 * @param payload any
 * @returns rejected nc as payload
 */
export const rejectNc = async (id: string, payload: any) => {
  let result;
  try {
    result = await axios.post(`/api/audits/nc/${id}/reject`, payload);
    return result;
  } catch (error) {}
};

export const finalRejectNc = async (id: string, payload: any) => {
  let result;
  try {
    result = await axios.post(`/api/audits/nc/${id}/finalReject`, payload);
    return result;
  } catch (error) {}
};

export const conversionNc = async (id: string, payload: any) => {
  let result;
  try {
    result = await axios.post(`/api/audits/nc/${id}/rejectToConvert`, payload);
    return result;
  } catch (error) {}
};

/**
 * @method closeNc
 * @param id string
 * @returns closed nc as payload
 */
export const closeNc = async (id: string, payload: any) => {
  let result;
  try {
    result = await axios.post(`/api/audits/nc/${id}/close`, payload);
    return result;
  } catch (error) {}
};

/**
 * @method deleteNc
 * @description Function to delete a summary entry
 * @param id string
 * @returns nothing
 */
export const deleteNc = async (id: string) => {
  let result;
  try {
    result = await axios.delete(`/api/audits/nc/${id}`);
    return result;
  } catch (error) {}
};

/**
 * @method buttonStatus
 * @description Function to check button status
 * @returns nothing
 */
export const buttonStatus = async (
  id: string,
  userId: string,
  type: string
) => {
  let result;
  try {
    result = await axios.post(`/api/audits/nc/${id}/getBtnStatus`, {
      userId: userId,
      type: type,
    });
    return result;
  } catch (error) {}
};
