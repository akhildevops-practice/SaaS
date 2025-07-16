import axios from "../../../../../apis/axios.global";
import { API_LINK } from "../../../../../config";

/**
 * @method getUserInfo
 * @description Function to get risk configuration based on username
 * @returns riskconfig(conditon and risk type), location and entity of orgId
 */

export const getUserRiskConfig = async () => {
  let result;
  try {
    result = await axios.get(API_LINK + "/api/riskconfig/getuserconfig");
    return result;
  } catch (error) {}
};
