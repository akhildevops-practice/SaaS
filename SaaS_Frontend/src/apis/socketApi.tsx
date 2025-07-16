import axios from "./axios.global";
import { API_LINK } from "../config";

/**
 * @method getUserInfo
 * @description Function to get user information
 * @returns get the user information
 */
export const getUserInfo = async () => {
  let result;
  try {
    result = await axios.get(API_LINK + "/api/user/getUserInfo");
    return result;
  } catch (error) {
  }
};
