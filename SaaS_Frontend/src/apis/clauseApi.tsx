import axios from "./axios.global";
import { API_LINK } from "../config";

/**
 * @method getClause
 * @description Function to get a particular clause
 * @param id {string}
 * @returns nothing
 */
export const getClause = (id: string) => {
  try {
    const result = axios.get(`${API_LINK}/api/clauses/${id}`);
    return result;
  } catch (error) {
    return error;
  }
};

/**
 * @method editClause
 * @description Function to edit a particular clause
 * @param id {string}
 * @param payload {any}
 * @returns nothing
 */
export const editClause = (id: string, payload: any) => {
  try {
    const result = axios.patch(`${API_LINK}/api/clauses/edit/${id}`, payload);
    return result;
  } catch (error) {
    return error;
  }
};

/**
 * @method getAllClauses
 * @description Function to list all clauses
 * @returns nothing
 */
export const getAllClauses = async (systemId: string) => {
  try {
    console.log("systemId in getallcaluses", systemId);
    const result = await axios.get(
      `${API_LINK}/api/systems/getclauses/${systemId}`
    );
    return result;
  } catch (error) {
    return error;
  }
};

export const ncTableSearch = async (
  searchQuery: string,
  organizationId: string,
  skip: number,
  limit: number
) => {
  try {
    const res = await axios.get(
      `${API_LINK}/api/audits/nc/search?text=${searchQuery}&organization=${organizationId}&skip=${skip}&limit=${limit}`
    );
    return res;
  } catch (error) {
    console.error(error);
    return error;
  }
};
