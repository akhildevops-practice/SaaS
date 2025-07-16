import axios from "./axios.global";
import { API_LINK } from "../config";

/**
 * @method getNcGraphData
 * @description Function to get all documents
 * @param id {string}
 * @returns an array containing the document list
 */
export const getNcGraphData = async (
  organization: string,
  filterField: string,
  location: string,
  financialYear: string = "",
  businessUnit: string = "",
  entityType: string = "",
  auditType: string = "",
  to: string = "",
  from: string = ""
) => {
  try {
    const res = await axios.get(
      `${API_LINK}/api/dashboard/chart/nc?organization=${organization}&filterField=${filterField}&location=${location}&auditYear=${financialYear}&businessUnit=${businessUnit}&auditedEntity=${entityType}&auditType=${auditType}&to=${to}&from=${from}`
    );
    return res;
  } catch (error) {
    console.error(error);
    return error;
  }
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
  skip: number,
  limit: number,
  location: string = "",
  auditType: string = "",
  auditor: string = "",
  system: string = "",
  from: string = "",
  to: string = "",
  clause: string = "",
  sort: string = ""
) => {
  let result;
  try {
    result = await axios.get(
      `/api/audits/nc/summary?skip=${skip}&limit=${limit}&location=${location}&auditType=${auditType}&auditor=${auditor}&system=${system}&from=${from}&to=${to}&clause=${clause}&sort=${sort}`
    );
    return result;
  } catch (error) {
    
  }
};

/**
 * @method ncTableSearch
 * @description Function to fetch table search
 * @param searchQuery {string}
 * @param organizationId {string}
 * @param skip {number}
 * @param limit {number}
 * @returns an array of table entry objects
 */
export const ncTableSearch = async (
  searchQuery: string,
  organizationId: string,
  skip: number,
  limit: number
) => {
  try {
    const res = await axios.get(
      `${API_LINK}/api/dashboard/nc/search?text=${searchQuery}&organization=${organizationId}&skip=${skip}&limit=${limit}`
    );
    return res;
  } catch (error) {
    console.error(error);
    return error;
  }
};

/**
 * @method fetchFinancialyear
 * @description Function to fetch financial year
 * @param organizationId {string}
 * @returns an array of strings containing the financial year
 */
export const fetchFinancialyear = async (organizationId: string) => {
  try {
    const res = await axios.get(
      `${API_LINK}/api/dashboard/getFinancialYear/${organizationId}`
    );
    return res;
  } catch (error) {
    console.error(error);
    return error;
  }
};
