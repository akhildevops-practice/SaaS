import { API_LINK } from "../config";
import axios from "./axios.global";

/**
 * @method searchSystem
 * @description Function to search system
 * @param type {string}
 * @param name {name}
 * @param location {location}
 * @param skip {skip}
 * @param limit {limit}
 * @returns an array list of systems based on the search tag
 */
export const searchSystem = async (
  type: string,
  name: string,
  location: string,
  skip: number,
  limit: number,
  payload: any
) => {
  let result;
  try {
    result = await axios.post(
      `${API_LINK}/api/systems/search?type=${type}&name=${name}&location=${location}&skip=${skip}&limit=${limit}`,
      payload
    );
    return result;
  } catch (error) {
    return error;
  }
};

/**
 * @method checkSystemNameUniqueness
 * @param systemName {string}
 * @returns a boolean value
 */
export const checkSystemNameUniqueness = async (systemName: string) => {
  let result;
  try {
    result = await axios.get(
      `${API_LINK}/api/systems/checkUniqueness?text=${systemName}`
    );
    return result;
  } catch (error) {
    return error;
  }
};

/**
 * @method deleteSystem
 * @description Function to delete a system
 * @param id {string}
 * @returns a deleted system
 */
export const deleteSystem = async (id: string) => {
  let result;
  try {
    result = await axios.delete(`${API_LINK}/api/systems/${id}`);
    return result;
  } catch (error) {
    return error;
  }
};

/**
 * @method deleteClauses
 * @description Function to delete clauses of a system
 * @param id {string}
 * @returns deleted clauses
 */
export const deleteClauses = async (id: string) => {
  let result;
  try {
    result = await axios.delete(`${API_LINK}/api/systems/clauses/${id}`);
    return result;
  } catch (error) {
    return error;
  }
};

/**
 * @method updateSystem
 * @description Function to update system
 * @param id {string}
 * @param payload {any}
 * @returns an updated system
 */
export const updateSystem = async (id: string, payload: any) => {
  let result;
  try {
    result = await axios.patch(`${API_LINK}/api/systems/${id}`, payload);

    return result;
  } catch (error) {
    return error;
  }
};

/**
 * @method updateClause
 * @description Function to update clause
 * @param id {string}
 * @param payload {any}
 * @returns an updated clause
 */
export const updateClause = async (id: string, payload: any) => {
  let result;
  try {
    result = await axios.patch(
      `${API_LINK}/api/systems/clauses/${id}`,
      payload
    );
    return result;
  } catch (error) {
    return error;
  }
};

/**
 * @method findClause
 * @description Function to find a clauses of a system
 * @param id {string}
 * @returns a clauses data
 */
export const findClause = async (id: string) => {
  let result;
  try {
    result = await axios.get(`${API_LINK}/api/systems/clauses/${id}`);
    return result;
  } catch (error) {
    return error;
  }
};

/**
 * @method findSystem
 * @description Function to find a system
 * @param id {string}
 * @returns a system entry
 */
export const findSystem = async (id: string) => {
  let result;
  try {
    result = await axios.get(`${API_LINK}/api/systems/${id}`);
    return result;
  } catch (error) {
    return error;
  }
};

/**
 * @method getAllSystems
 * @description Function to get all systems from the database
 * @returns an array of systems
 */
export const getAllSystems = async (skip: number, limit: number) => {
  let result;
  try {
    result = await axios.get(
      `${API_LINK}/api/systems?skip=${skip}&limit=${limit}`
    );
    return result;
  } catch (error) {
    return error;
  }
};

/**
 * @method postSystem
 * @description Function to post a system
 * @param payload
 * @returns
 */
export const postSystem = async (payload: any) => {
  let result;
  try {
    result = await axios.post(`${API_LINK}/api/systems`, payload);
    return result;
  } catch (error: any) {
    console.log("error", error);
    console.log("error2", error.response.status);

    return { error: error.data, status: error.response.status };
  }
};

/**
 * @method postClauses
 * @description Function to post a clause
 * @param payload
 * @returns
 */
export const postClauses = async (payload: any) => {
  let result;
  try {
    result = await axios.post(`${API_LINK}/api/systems/clauses`, payload);
    return result;
  } catch (error: any) {
    console.log("error", error);
    console.log("error2", error.response.status);
    return { error: error.data, status: error.response.status };
  }
};

/**
 * @method getSystemTypes
 * @description Function to get system list
 * @param realName: string
 * @returns
 */
export const getSystemTypes = async (realName: string) => {
  let result;
  try {
    result = await axios.get(
      `${API_LINK}/api/organization/systemtype/${realName}`
    );
    return result;
  } catch (error) {
    return error;
  }
};

/**
 * @method getSystems
 * @description Function to get system list by type
 * @param realName: string
 * @returns
 */
export const getSystems = async (id: string) => {
  let result;
  try {
    result = await axios.get(`${API_LINK}/api/systems/byType/${id}`);
    return result;
  } catch (error) {
    return error;
  }
};
export const getAll = async (id: string) => {
  let result;
  try {
    console.log(
      "urlvalue",
      `${API_LINK}/api/systems/displayAllSystemsForOrg/${id}`
    );
    result = await axios.get(
      `${API_LINK}/api/systems/displayAllSystemsForOrg/${id}`
    );
    return result;
  } catch (error) {
    return error;
  }
};
/**
 * @method getSystemWithTypes
 * @description Function to get system names with system types
 * @param realmName {string}
 * @returns
 */
export const getSystemWithTypes = async (realmName: string) => {
  let result;
  try {
    result = await axios.get(
      `${API_LINK}/api/organization/systemtype/${realmName}/systems`
    );
    return result;
  } catch (error) {
    return error;
  }
};
