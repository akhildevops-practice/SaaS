import axios from "./axios.global";
import { API_LINK } from "../config";
import getAppUrl from "../utils/getAppUrl";
import { getUserInfo } from "./socketApi";
/**
/**
 * @method postAvatar
 * @description Function to post avatar image to server
 * @returns a response object
 */
export const postAvatar = async (payload: object) => {
  let result;
  const dataNew = await getUserInfo();
  const locationName = dataNew?.data?.location?.locationName;
  const realmName = getAppUrl()
  const url = locationName?`/api/user/avatar?realm=${realmName}&location=${locationName}`:`/api/user/avatar?realm=${realmName}`
  try {
    result = await axios.post(API_LINK + url, payload);
    return result;
  } catch (error) {
  }
};
