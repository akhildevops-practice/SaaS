import axios from "./axios.global";
import { API_LINK } from "config";

/**
 * @method createMeeting
 * @description Function to save a new audit
 * @param payload {any}
 * @returns a table entry response after successful insertion
 */
export const createMeeting = async (payload: any) => {
  let result;
  try {
    result = await axios.post(API_LINK + "/api/mrm/createMeeting", payload);
    return result;
  } catch (error) {}
};

/**
 * @method getAllMeeting
 * @description Function to get all suggestions
 * @returns an array of template suggestions
 */
export const getAllMeeting = async (payload: any) => {
  let result;
  // console.log("payload type", typeof payload.selectedMeetingOwner);
  try {
    result = await axios.get(
      API_LINK +
        `/api/mrm/getAllMeeting?orgId=${payload.orgId}&page=${payload.page}&limit=${payload.limit}&unitId=${payload.unitId}&currentYear=${payload?.currentYear}&selectedOwner=${payload?.selectedMeetingOwner}&entityId=${payload.entityId}&selectedMeetingType=${payload.selectedMeetingType}`
    );
    // console.log("console==>", result);
    return result;
  } catch (error) {}
};

export const getMyMeeting = async (payload: any) => {
  let result;
  try {
    result = await axios.get(
      API_LINK +
        `/api/mrm/myMeetings?orgId=${payload.orgId}&page=${payload.page}&limit=${payload.limit}&unitId=${payload.unitId}&currentYear=${payload.currentYear}`
    );
    console.log("console==>", result);
    return result;
  } catch (error) {}
};

export const getParticipantMeeting = async (payload: any) => {
  let result;
  try {
    result = await axios.get(
      API_LINK +
        `/api/mrm/participantMeetings?orgId=${payload.orgId}&page=${payload.page}&limit=${payload.limit}&unitId=${payload.unitId}&currentYear=${payload.currentYear}`
    );
    // console.log("console==>", result);
    return result;
  } catch (error) {}
};
export const getAgendaOwnerMeeting = async (payload: any) => {
  let result;
  try {
    result = await axios.get(
      API_LINK +
        `/api/mrm/agendaOwnerMeetings?orgId=${payload.orgId}&page=${payload.page}&limit=${payload.limit}&unitId=${payload.unitId}&currentYear=${payload.currentYear}`
    );
    // console.log("console==>", result);
    return result;
  } catch (error) {}
};
export const getMyActionPoints = async (payload: any) => {
  let result;
  try {
    result = await axios.get(
      API_LINK +
        `/api/mrm/myActionPoints?orgId=${payload.orgId}&page=${payload.page}&limit=${payload.limit}&unitId=${payload.unitId}&currentYear=${payload.currentYear}`
    );
    //  console.log("console==>", result);
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

export const getAgendaDecisionForOwner = async (id: any, id1: any) => {
  let result;
  try {
    result = await axios.get(
      API_LINK + `/api/mrm/getAgendaDecisionForOwner/${id}/${id1}`
    );
    return result;
  } catch (error) {}
};

/**
 * @method deleteMeeting
 * @description Function to delete a template entry
 * @param id {string}
 * @returns a template entry which was deleted
 */
export const deleteMeeting = async (id: string) => {
  let result;
  try {
    result = await axios.delete(`${API_LINK}/api/mrm/deleteMeeting/${id}`);
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

export const getPendingActionPointsForMeeting = async (id: any) => {
  let result;
  try {
    result = await axios.get(
      `${API_LINK}/api/mrm/getPendingActionPointsforMeetingType/${id}`
    );
    return result;
  } catch (error) {}
};
