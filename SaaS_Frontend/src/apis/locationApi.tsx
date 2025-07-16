import axios from "./axios.global";
import { API_LINK } from "../config";

/**
 * @method getLocationById
 * @description Function to get location id
 * @param id {string}
 * @returns a location id string
 */
export const getLocationById = async (id: string) => {
  let result;
  try {
    result = await axios.get(`${API_LINK}/api/location/getLocation/byId/${id}`);
    return result;
  } catch (error) {}
};
export const getAllLocations = async (id: string) => {
  let result;
  try {
    result = await axios.get(`${API_LINK}/api/location/getAllLocations/${id}`);
    return result;
  } catch (error) {}
};

/**
 * @method getAllLocation
 * @description Function to fetch all location
 * @param realmName {string}
 * @returns a list of all locations of a specific realm name
 */
export const getAllLocation = async (realmName: string) => {
  let result;
  try {
    result = await axios.get(
      `${API_LINK}/api/location/getLocationsForOrg/${realmName}`
    );
    return result;
  } catch (error) {}
};
