import { API_LINK } from "../config";
import axios from "./axios.global";

/**
 * @method getOrganizationData
 * @description Function to fetch all organization data from the backend
 * @return an object containing organization details
 */
export const getOrganizationData = async (realmName: string) => {
  let result;
  try {
    result = await axios.get(`${API_LINK}/api/organization/${realmName}`);
    return result;
  } catch (error) {
  }
};
