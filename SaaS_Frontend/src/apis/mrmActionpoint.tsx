import axios from "./axios.global";
import { API_LINK } from "config";

/**
 * @method createActionPoint
 * @description Function to save a new audit
 * @param payload {any}
 * @returns a table entry response after successful insertion
 */
export const createActionPoint = async (payload: any) => {
  let result;
  try {
    result = await axios.post(
      API_LINK + "/api/actionitems/createActionItem",
      payload
    );
    return result;
  } catch (error) {}
};

export const updateActionPoint = async (id: any, payload: any) => {
  let result;
  try {
    result = await axios.patch(
      API_LINK + `/api/actionitems/updateActionItem/${id}`,
      payload
    );
    return result;
  } catch (error) {}
};

/**
 * @method getAllActionPointsData
 * @description Function to get all suggestions
 * @returns an array of template suggestions
 */
export const getAllActionPointsData = async (payload: any) => {
  let result;
  try {
    result = await axios.get(
      API_LINK +
        `/api/actionitems/getActionItemForSourceMRM?source=MRM&orgId=${payload.orgId}&page=${payload.page}&limit=${payload.limit}&unitId=${payload.unitId}&currentYear=${payload.currentYear}&selectedOwner=${payload.selectedOwner}&entityId=${payload.entityId}&selectedMeetingType=${payload.selectedActionMeetingType}`
    );
    // console.log("actionpoints", result);
    return result;
  } catch (error) {}
};

/**
 * @method getAgendaForOwner
 * @description Function to get all suggestions
 * @returns an array of template suggestions
 */
export const getAgendaForOwner = async (id: any) => {
  let result;
  try {
    result = await axios.get(API_LINK + `/api/mrm/getAgendaforowner/${id}`);
    return result;
  } catch (error) {}
};

/**
 * @method deleteActionPoint
 * @description Function to delete a template entry
 * @param id {string}
 * @returns a template entry which was deleted
 */
export const deleteActionPoint = async (id: string) => {
  let result;
  try {
    result = await axios.delete(
      `${API_LINK}/api/actionitems/deleteActionItem/${id}`
    );
    return result;
  } catch (error) {}
};

/**
 * @method updateMeeting
 * @description Function to update a template entry
 * @param id {string}
 * @param payload {any}
 * @returns the updated template entry
 */
export const updateMeeting = async (id: any, payload: any) => {
  let result;
  try {
    result = await axios.patch(
      `${API_LINK}/api/mrm/updateMeeting/${id}`,
      payload
    );
    return result;
  } catch (error) {}
};

/**
 * @method getMeetingById
 * @description Function to update a template entry
 * @param id {string}
 * @param payload {any}
 * @returns the updated template entry
 */
export const getMeetingById = async (id: any) => {
  let result;
  try {
    result = await axios.get(`${API_LINK}/api/mrm/getMeetingById/${id}`);
    return result;
  } catch (error) {}
};

/**
 * @method getActionPointMeetingById
 * @description Function to update a template entry
 * @param id {string}
 * @param payload {any}
 * @returns the updated template entry
 */
export const getActionPointMeetingById = async (id: any) => {
  let result;
  try {
    result = await axios.get(
      `${API_LINK}/api/actionitems/getActionItemForReference/${id}`
    );
    return result;
  } catch (error) {}
};
