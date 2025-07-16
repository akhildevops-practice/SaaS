import axios from "./axios.global";
import { API_LINK } from "../config";

/**
 * @method getAllDocuments
 * @description Function to get all documents
 * @param id {string}
 * @returns an array containing the document list
 */
export const getAllDocuments = async (realmName: string) => {
  let result;
  try {
    result = await axios.get(`${API_LINK}/api/documents/${realmName}/all`);
    return result;
  } catch (error) {
    
  }
};

export const getAllDocumentsByEntity = async (entity: string) => {
  let result;
  try {
    result = await axios.get(`${API_LINK}/api/documents/fetchDocumentByEntity/${entity}`);
    return result;
  } catch (error) {
    
  }
};

export const isValidDocType = async (text: string) => {
  let result;
  try {
    result = await axios.get(`${API_LINK}/api/doctype/docsValid?text=${text}`);
    return result;
  } catch (error) {
    
  }
};
