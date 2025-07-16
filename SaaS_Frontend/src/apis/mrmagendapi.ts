import axios from "./axios.global";
import { API_LINK } from "config";

/**
 * @method createAgenda
 * @description Function to save a new audit
 * @param payload {any}
 * @returns a table entry response after successful insertion
 */
export const createAgenda = async (payload: any) => {
    let result;
    try {
      result = await axios.post(API_LINK + "/api/mrm/createAgenda", payload);
      console.log("agenda result", result)
      return result;
    } catch (error) {}
  };


/**
 * @method getAgendaByMeetingType
 * @description Function to get all suggestions
 * @returns an array of template suggestions
 */
export const getAgendaByMeetingType = async (id: any) => {
    let result;
    try {
      result = await axios.get(`${API_LINK}/api/mrm/getAgendaByMeetingType/${id}`);
      return result;
    } catch (error) {}
  };


/**
 * @method deleteAgenda
 * @description Function to delete a template entry
 * @param id {string}
 * @returns a template entry which was deleted
 */
export const deleteAgenda = async (id: any) => {
    let result;
    console.log("id", id)
    try {
      result = await axios.delete(`${API_LINK}/api/mrm/deleteAgendaById/${id}`);
      console.log(result)
      return result;
    } catch (error) {}
  };


  /**
 * @method updateAgenda
 * @description Function to update a template entry
 * @param id {string}
 * @param payload {any}
 * @returns the updated template entry
 */
export const updateAgenda = async (id: string, payload: any) => {
    let result;
    try {
      result = await axios.patch(`${API_LINK}/api/mrm/updateAgenda/${id}`, payload);
      return result;
    } catch (error) {}
  };