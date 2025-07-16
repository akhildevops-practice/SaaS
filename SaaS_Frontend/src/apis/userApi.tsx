import axios from "./axios.global";
import { API_LINK } from "../config";

/**
 * @method getUserInformation
 * @description Function to get all current user data
 * @param id {string}
 * @returns a user object
 */
export const getUserInformation = async (id: string) => {
  let result;
  try {
    result = await axios.get(`${API_LINK}/api/user/getUser/byId/${id}`);
    return result;
  } catch (error) {
  }
};

/**
 * @method getAllTemplateAuthors
 * @description Function to get all users who can create a template
 * @param realmName string
 * @returns the list of all users who can create a template
 */
export const getAllTemplateAuthors = async (realmName: string) => {
  let result;
  try {
    result = await axios.get(`${API_LINK}/api/user/getAllTemplateAuthors/${realmName}`);
    return result;
  } catch (error) {
  }
}
