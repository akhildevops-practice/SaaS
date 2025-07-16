import axios from "./axios.global";
import { API_LINK } from "../config";

/**
 * @method auditTypeData
 * @description Get the audit type graph data from database
 * @param organization
 * @param filterField
 * @param location
 * @returns {Promise<*>}
 */
export const fetchGraphData = async (
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
      `${API_LINK}/api/dashboard/chart/audit?organization=${organization}&filterField=${filterField}&location=${location}&auditYear=${financialYear}&businessUnit=${businessUnit}&auditedEntity=${entityType}&auditType=${auditType}&to=${to}&from=${from}`
    );
    return res;
  } catch (error) {
    console.error(error);
    return error;
  }
};

/**
 * @method fetchTableData
 * @description Function to fetch table data from the backend
 * @param location {string}
 * @param financialYear {string}
 * @param businessUnit {string}
 * @param entityType {string}
 * @param auditType {string}
 * @param to {string}
 * @param from {string}
 * @param limit {number}
 * @param skip {number}
 * @param system {string}
 * @param auditedDocuments {string}
 * @returns an array of table entries
 */
export const fetchTableData = async (
  location: string = "",
  financialYear: string = "",
  businessUnit: string = "",
  entityType: string = "",
  auditType: string = "",
  to: string = "",
  from: string = "",
  limit: number,
  skip: number,
  system: string = "",
  auditedDocuments: any = ""
) => {
  try {
    const res = await axios.get(
      `${API_LINK}/api/dashboard/audit/filter?location=${location}&auditYear=${financialYear}&businessUnit=${businessUnit}&auditedEntity=${entityType}&auditType=${auditType}&to=${to}&from=${from}&skip=${skip}&limit=${limit}&system=${system}&auditedDocuments=${auditedDocuments}`
    );
    return res;
  } catch (error) {
    console.error(error);
    return error;
  }
};

/**
 * @method tableSearch
 * @description Function to fetch table data after a search is performed
 * @param searchQuery {string}
 * @param organizationId {string}
 * @param skip {number}
 * @param limit {number}
 * @returns an array of objects containing table entries
 */
export const tableSearch = async (
  searchQuery: string,
  organizationId: string,
  skip: number,
  limit: number
) => {
  try {
    const res = await axios.get(
      `${API_LINK}/api/dashboard/audit/search?text=${searchQuery}&organization=${organizationId}&skip=${skip}&limit=${limit}`
    );
    return res;
  } catch (error) {
    console.error(error);
    return error;
  }
};
