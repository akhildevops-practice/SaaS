import { API_LINK } from "../config";
import axios from "./axios.global";

/**
 * @method getAllNotifications
 * @description Function to fetch all notifications from the backend
 * @return an object containing the list of notifications of type today, yesterday and older. It also contains the unread notification count.
 */
export const getAllNotifications = async () => {
  let result;
  try {
    // result = await axios.get()
    result = await axios.get(API_LINK + "/api/notifications");
    return result;
  } catch (error) {
    
  }
};

/**
 * @method changeNotificationStatus
 * @description Function to change read status of a single notification
 * @returns a response object
 */
export const changeNotificationStatus = async (id: string) => {
  let result;
  try {
    //patch status
    result = await axios.patch(API_LINK + "/api/notifications/" + id);
    return result;
  } catch (error) {
    
  }
};

/**
 * @method clearNotifications
 * @description Function to clear all notifications
 * @returns a response object
 */
export const clearNotifications = async () => {
  let result;
  try {
    result = await axios.delete(API_LINK + "/api/notifications");
    return result;
  } catch (error) {
    
  }
};
