import axios from "./axios.global";
import { API_LINK } from "config";

/**
 * @method saveAuditFindings
 * @description Function to save a new audit
 * @param payload {any}
 * @returns a table entry response after successful insertion
 */
export const saveAuditFindings = async (payload: any) => {
    let result;
    try {
      result = await axios.post(API_LINK + "/api/audit-settings/newAuditFindings", payload);
      return result;
    } catch (error) {}
  };


/**
 * @method getAllAuditFindings
 * @description Function to get all suggestions
 * @returns an array of template suggestions
 */
export const getAllAuditFindings = async (page:any, rowsPerPage:any) => {
    let result;
    try {
      result = await axios.get(API_LINK + `/api/audit-settings/getAllAuditFindings?page=${page+1}&limit=${rowsPerPage}`);
      return result;
    } catch (error) {}
  };


/**
 * @method deleteAuditFindings
 * @description Function to delete a template entry
 * @param id {string}
 * @returns a template entry which was deleted
 */
export const deleteAuditFindings = async (id: string) => {
    let result;
    try {
      result = await axios.delete(`${API_LINK}/api/audit-settings/deleteAuditFindingsById/${id}`);
      return result;
    } catch (error) {}
  };


  /**
 * @method updateAuditFindings
 * @description Function to update a template entry
 * @param id {string}
 * @param payload {any}
 * @returns the updated template entry
 */
export const updateAuditFindings = async (id: any, payload: any) => {
    let result;
    try {
      result = await axios.put(`${API_LINK}/api/audit-settings/updateAuditFindingsById/${id}`, payload);
      return result;
    } catch (error) {}
  };