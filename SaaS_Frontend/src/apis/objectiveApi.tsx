import axios from "./axios.global";
import { API_LINK } from "../config";

/**
 * @method getAuditTemplate
 * @description Function to get all audit templates
 * @param id {string}
 * @returns an array containing audit template
 */
export const getAuditTemplate = async (id: string) => {
  let result;
  try {
    result = await axios.get(API_LINK + "/api/audit-template/" + id);
    return result;
  } catch (error) {
    console.log({ error });
  }
};

/**
 * @method getAllSuggestions
 * @description Function to get all suggestions
 * @returns an array of template suggestions
 */
export const getAllSuggestions = async () => {
  let result;
  try {
    result = await axios.get(API_LINK + "/api/audit-template/getSuggestions");
    return result;
  } catch (error) {
    console.log({ error });
  }
};

/**
 * @method saveAuditTemplatee
 * @description Function to save a new audit
 * @param payload {any}
 * @returns a table entry response after successful insertion
 */
export const saveAuditTemplate = async (payload: any) => {
  let result;
  try {
    result = await axios.post(API_LINK + "/api/audit-template", payload);
    return result;
  } catch (error) {
    console.log({ error });
  }
};

/**
 * @method isTemplateNameUnique
 * @description Function to check if the template name is unique
 * @param auditName {string}
 * @returns a boolean value
 */
export const isTemplateNameUnique = async (auditName: string) => {
  let result;
  try {
    result = await axios.get(
      API_LINK + "/api/audit-template/isUnique?text=" + auditName
    );
    return result;
  } catch (error) {
    console.log({ error });
  }
};

/**
 * @method getAllTemplates
 * @description Function to get all template listing
 * @param skip {number}
 * @param limit {number}
 * @returns a list of template entries
 */
export const getAllTemplates = async (skip: number, limit: number) => {
  let result;
  try {
    result = await axios.get(
      API_LINK + "/api/audit-template?skip=" + skip + "&limit=" + limit
    );
    return result;
  } catch (error) {
    console.log({ error });
  }
};

/**
 * @method searchTemplate
 * @param title {string}
 * @param createdBy {string}
 * @param skip {number}
 * @param limit {number}
 * @returns a template list of matched entries
 */
export const searchTemplate = async (
  title: string = "",
  createdBy: string = "",
  skip: number,
  limit: number
) => {
  let result;
  try {
    result = await axios.get(
      `${API_LINK}/api/audit-template/search?title=${title}&createdBy=${createdBy}&skip=${skip}&limit=${limit}`
    );
    return result;
  } catch (error) {
    console.log({ error });
  }
};

/**
 * @method deleteTemplate
 * @description Function to delete a template entry
 * @param id {string}
 * @returns a template entry which was deleted
 */
export const deleteTemplate = async (id: string) => {
  let result;
  try {
    result = await axios.delete(`${API_LINK}/api/audit-template/${id}`);
    return result;
  } catch (error) {
    console.log({ error });
  }
};

/**
 * @method updateTemplate
 * @description Function to update a template entry
 * @param id {string}
 * @param payload {any}
 * @returns the updated template entry
 */
export const updateTemplate = async (id: string, payload: any) => {
  let result;
  try {
    result = await axios.patch(`${API_LINK}/api/audit-template/${id}`, payload);
    return result;
  } catch (error) {
    console.log({ error });
  }
};

/**
 * @method getCalendarEntries
 * @description Function to get all audit entries
 * @returns a list of calendar events
 */
export const getCalendarEntries = async () => {
  let result;
  try {
    result = await axios.get(`${API_LINK}/api/audits/calendar`);
    return result;
  } catch (error) {
    console.log({ error });
    return error;
  }
};

/**
 * @method getAllAuditors
 * @description Function to get the list of all auditors
 * @param realmName {string}
 * @returns an array list of all auditorss
 */
export const getAllAuditors = async (realmName: string) => {
  let result;
  try {
    result = await axios.get(`${API_LINK}/api/user/getAuditors/${realmName}`);
    return result;
  } catch (error) {
    console.log({ error });
    return error;
  }
};

/**
 * @method getAllAuditees
 * @description Function to get the list of all auditorss
 * @param realmName {string}
 * @returns an array list of all auditorss
 */
export const getAllAuditees = async (id: string) => {
  let result;
  try {
    result = await axios.get(`${API_LINK}/api/user/getAuditeesByEntity/${id}`);
    return result;
  } catch (error) {
    console.log({ error });
    return error;
  }
};

/**
 * @method addAttachments
 * @description Function to upload an attachment
 * @param realmName {string}
 * @returns the newly attached file
 */
export const addAttachment = async (payload: any) => {
  let result;
  try {
    result = await axios.post(`${API_LINK}/api/audits/attachment`, payload);
    return result;
  } catch (error) {
    console.log({ error });
    return error;
  }
};

/**
 * @method deleteAttachment
 * @description Function to delete an attachment
 * @param realmName {string}
 * @returns nothing
 */
export const deleteAttachment = async (payload: any) => {
  let result;
  try {
    result = await axios.post(
      `${API_LINK}/api/audits/attachment/delete`,
      payload
    );
    return result;
  } catch (error) {
    console.log({ error });
    return error;
  }
};

/**
 * @method getAuditCreationTemplateById
 * @description Get a particular template by ID for populating the checklist
 * @param id {string}
 * @returns a checklist
 */
export const getAuditCreationTemplateById = async (id: string) => {
  let result;
  try {
    result = await axios.get(`${API_LINK}/api/audit-template/${id}/audit`);
    return result;
  } catch (error) {
    console.log({ error });
    return error;
  }
};

/**
 * @method createAudit
 * @description Function to create a new audit
 * @param payload {any}
 * @returns
 */
export const createAudit = async (payload: any) => {
  let result;
  try {
    result = await axios.post(`${API_LINK}/api/audits`, payload);
    return result;
  } catch (error) {
    console.log({ error });
    return error;
  }
};

/**
 * @method getAudit
 * @description Function to retrieve a audit
 * @param payload {any}
 * @returns
 */
export const getAudit = async (id: string) => {
  let result;
  try {
    result = await axios.get(`${API_LINK}/api/audits/${id}`);
    return result;
  } catch (error) {
    console.log({ error });
    return error;
  }
};

/**
 * @method editAudit
 * @description Function to edit an audit
 * @param payload {any}
 * @returns
 */
export const editAudit = async (id: string, payload: any) => {
  let result;
  try {
    result = await axios.patch(`${API_LINK}/api/audits/${id}`, payload);
    return result;
  } catch (error) {
    console.log({ error });
    return error;
  }
};

/**
 * @method fetchAuditReportTableData
 * @param title {string}
 * @param createdBy {string}
 * @param skip {number}
 * @param limit {number}
 * @returns a template list of matched entries
 */
export const fetchAuditReportTableData = async (
  skip: number,
  limit: number,
  auditYear: string = "",
  location: string = "",
  auditType: string = "",
  systemName: string = "",
  auditor: string = ""
) => {
  let result;
  try {
    result = await axios.get(
      `${API_LINK}/api/audits/search?auditYear=${auditYear}&location=${location}&auditType=${auditType}&system=${systemName}&auditor=${auditor}&skip=${skip}&limit=${limit}`
    );
    return result;
  } catch (error) {
    console.log({ error });
  }
};

/**
 * @method sortTable
 * @param title {string}
 * @param createdBy {string}
 * @param skip {number}
 * @param limit {number}
 * @returns a template list of matched entries
 */
export const sortData = async (
  skip: number,
  limit: number,
  sort: string,
  auditYear: string = "",
  location: string = "",
  auditType: string = "",
  systemName: string = "",
  auditor: string = ""
) => {
  let result;
  try {
    result = await axios.get(
      `${API_LINK}/api/audits/search?auditYear=${auditYear}&location=${location}&auditType=${auditType}&system=${systemName}&auditor=${auditor}&skip=${skip}&limit=${limit}&sort=${sort}`
    );
    return result;
  } catch (error) {
    console.log({ error });
  }
};

/**
 * @method isAuditNumberUnique - Function to check if the audit number is unique
 * @param auditNumber {string}
 * @returns true if the audit number is unique
 * @returns false if the audit number is not unique
 * @returns error if the audit number is not unique
 */
export const isAuditNumberUnique = async (payload: any) => {
  let result;
  try {
    result = await axios.post(`${API_LINK}/api/audits/isAuditNumberUnique`, {
      auditNumber: payload,
    });
    return result;
  } catch (error) {
    return error;
  }
};

/**
 * @method addAuditReportData
 * @description Function to add a new audit report
 * @param payload {any}
 * @returns the newly created audit report
 * @returns error if the audit report is not created
 */
export const addObjectiveMasterData = async (payload: any) => {
  try {
    const res = await axios.post(
      `${API_LINK}/api/objective/createObjectMaster`,
      payload
    );
    return {
      success: true,
      respond: res.data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response.data.message,
    };
  }
};

/**
 * @method getObjectiveByID
 * @param id {string}
 * @returns all the audit details
 */
export const getObjectiveById = async (id: string) => {
  try {
    const response = await axios.get(
      `${API_LINK}/api/objective/getObjectMasterById/${id}`
    );
    return {
      success: true,
      respond: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response.data.message,
    };
  }
};

/**
 * @method auditRating
 * @description Function to post the audit rating
 * @param auditId {string}
 * @param userId {string}
 * @param rating {number}
 * @param comment {string}
 * @returns the updated audit report
 * @returns error if the audit report is not updated
 */
export const auditRating = async (
  auditId: string,
  userId: number,
  rating: number,
  comment: string
) => {
  try {
    await axios.post(`${API_LINK}/api/audits/${auditId}/rateAuditor`, {
      rating,
      comment,
      user: userId,
    });
    return {
      success: true,
      message: "Rating submitted successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response.data.message,
    };
  }
};

/**
 * @method fetchAuditRating
 * @description Function to get the audit rating
 * @param auditId {string}
 * @param userId {string}
 * @returns  audit rating
 * @returns error if the audit rating is not fetched
 */
export const fetchAuditRating = async (auditId: string, auditorId: string) => {
  try {
    const response = await axios.get(
      `${API_LINK}/api/audits/${auditId}/getAuditorRating/${auditorId}`
    );
    return response.data;
  } catch (error: any) {
    return error;
  }
};

/**
 * @method draftAudit
 * @description Function to patch the audit rating
 * @param payload {any}
 * @returns error if the audit report is not updated
 */
export const draftAudit = async (payload: any) => {
  let result;
  try {
    result = await axios.post(`${API_LINK}/api/audits/draft`, payload);
    return result;
  } catch (error) {
    console.log({ error });
    return error;
  }
};

/**
 * @method checkRatePermissions
 * @description Function to get a boolean value to check if the logged in user has rating permissions
 * @param auditId: {string}
 * @param payload {any}
 * @returns a boolean value or an error
 */
export const checkRatePermissions = async (auditId: string, payload: any) => {
  let result;
  try {
    result = await axios.post(
      `${API_LINK}/api/audits/${auditId}/isAuditee`,
      payload
    );
    return result;
  } catch (error) {
    console.log({ error });
    return error;
  }
};

/**
 * @method checkIsAuditor
 * @description Function to check if the current logged in user is an auditor
 * @param auditId {string}
 * @param payload {payload}
 * @returns a boolean value
 */
export const checkIsAuditor = async (auditId: string, payload: any) => {
  let result;
  try {
    result = await axios.post(
      `${API_LINK}/api/audits/${auditId}/isAuditor`,
      payload
    );
    return result;
  } catch (error) {
    console.log({ error });
    return error;
  }
};
