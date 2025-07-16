import axios from "./axios.global";
import { API_LINK } from "../config";

/**
 * @method getAllEntities
 * @description Function to get all entities
 * @param realmName {string}
 * @returns an array containing all the entities
 */
export const getAllEntities = async () => {
  let result;
  try {
    result = await axios.get(`${API_LINK}/api/entity`);
    return result;
  } catch (error) {
    
  }
};

/**
 * @method getEntitiesByUserLocation
 * @description Function to fetch all entities based on user location 
 * @returns a list of entities
 */
export const getEntitiesByUserLocation = async () => {
  let result;
  try {
    result = await axios.get(`${API_LINK}/api/entity/byUserLocation`);
    return result;
  } catch (error) {
    
  }
}

  /**
 * @method getEntityByLocationId
 * @description Function to fetch all entities based on param locationId 
 * @returns a list of entities
 */
export const getEntityByLocationId = async (locationId : any) => {
  let result;
  try {
    result = await axios.get(`${API_LINK}/api/entity/getEntityByLocationId/${locationId}`);
    return result;
  } catch (error) {
    
  }
}
