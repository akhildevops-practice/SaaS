import axios from "apis/axios.global";

interface DocumentFilterPayload {
  page: number;
  limit: number;
  filterArr?: {
    filterField: string;
    filterString?: string; //need for documentName field
    fieldArr?: string[];
  }[];
  organizationId: string;
}

export const fetchAllDocuments = async (
  payload: DocumentFilterPayload,
  userDetails: any
) => {
  const res = await axios.post(
    `/api/documents/publisheddocs/${userDetails?.organizationId}/${userDetails?.id}`,
    {
      ...payload,
      userId: userDetails?.id,
      userEntityId: userDetails?.entityId,
      userLocationId: userDetails?.locationId,
    }
  );
  return res.data;
};

export const fetchMyDocuments = async (
  payload: DocumentFilterPayload,
  userDetails: any
) => {
  const res = await axios.post(
    `/api/documents/mydocs/${userDetails?.organizationId}/${userDetails?.id}`,
    {
      ...payload,
      userId: userDetails?.id,
      userEntityId: userDetails?.entityId,
      userLocationId: userDetails?.locationId,
    }
  );
  return res.data;
};

export const fetchFavoriteDocuments = async (
  payload: DocumentFilterPayload,
  userDetails: any
) => {
  const res = await axios.post(
    `/api/documents/myfavdocs/${userDetails?.organizationId}/${userDetails?.id}`,
    {
      ...payload,
      userId: userDetails?.id,
      userEntityId: userDetails?.entityId,
      userLocationId: userDetails?.locationId,
    }
  );
  return res.data;
};

export const fetchDistributedDocuments = async (
  payload: DocumentFilterPayload,
  userDetails: any
) => {
  const res = await axios.post(
    `/api/documents/distributeddocs/${userDetails?.organizationId}/${userDetails?.id}`,
    payload
  );
  return res.data;
};

export const fetchInWorkflowDocuments = async (
  payload: DocumentFilterPayload,
  userDetails: any
) => {
  const res = await axios.post(
    `/api/documents/inworkflowdocs/${userDetails?.organizationId}/${userDetails?.id}`,
    payload
  );
  return res.data;
};

// Add other APIs if needed
