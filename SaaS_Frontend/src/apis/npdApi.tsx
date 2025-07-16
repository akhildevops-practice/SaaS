import { API_LINK } from "config";
import axios from "./axios.global";

export const getAllGanttData = async () => {
  let result;
  try {
    result = await axios.get(API_LINK + `/api/npd/getAllGanttChart`);
    return result;
  } catch (error) {}
};

export const getByIDGanttDataById = async (id: string) => {
  let result;
  try {
    result = await axios.get(API_LINK + `/api/npd/getByIdGanttChart/${id}`);
    return result;
  } catch (error) {}
};

export const getByIdGanttData = async (id: string, payload: any) => {
  let result;

  try {
    result = await axios.get(
      API_LINK +
        `/api/npd/getByIdNPDID/${id}?skip=${payload?.page}&limit=${payload?.limit}&departmentId=${payload?.departmentId}&user=${payload?.user}`
    );
    return result;
  } catch (error) {}
};

export const getByIdGanttDataFilterList = async (id: string) => {
  let result;
  try {
    result = await axios.get(API_LINK + `/api/npd/getDataByIdNpdGantt/${id}`);
    return result;
  } catch (error) {}
};

export const getAllNPDListDrop = async () => {
  let result;
  try {
    result = await axios.get(API_LINK + `/api/npd/getAllNPDList`);
    return result;
  } catch (error) {}
};

export const getAllNPDDptListDrop = async () => {
  let result;
  try {
    result = await axios.get(API_LINK + `/api/npd/getAllNPDDptList`);
    return result;
  } catch (error) {}
};

export const updateTaskGanttTask = async (id: any, payload: any) => {
  let result;
  try {
    result = await axios.put(
      API_LINK + `/api/npd/updateGanttChart/${id}`,
      payload
    );
    return result;
  } catch (error) {}
};

export const updateManyTaskGanttTask = async (id: any, payload: any) => {
  let result;
  try {
    result = await axios.put(
      API_LINK + `/api/npd/updateGanttChartTask/${id}`,
      payload
    );
    return result;
  } catch (error) {}
};

export const createNpdGanttChart = async (payload: any) => {
  let result;
  try {
    result = await axios.post(API_LINK + "/api/npd/createGanttChart", payload);
    return result;
  } catch (error) {}
};

export const createNpdManyGanttChart = async (payload: any) => {
  let result;
  try {
    result = await axios.post(
      API_LINK + "/api/npd/createManyGanttChart",
      payload
    );
    return result;
  } catch (error) {}
};

export const updateManyGanttChartPic = async (data: any) => {
  let result;
  const { dptId, picId } = data;
  try {
    result = await axios.get(
      API_LINK + `/api/npd/updateManyGanttChart/${dptId}/${picId}`
    );
    return result;
  } catch (error) {}
};

export const deleteGanttChartData = async (id: string) => {
  let result;
  try {
    result = await axios.delete(`${API_LINK}/api/npd/deleteGanttChart/${id}`);
    return result;
  } catch (error) {}
};

export const getByIdGanttNpdDptData = async (id: string) => {
  let result;
  try {
    result = await axios.get(
      API_LINK + `/api/configuration/getNpdConfigByDpt/${id}`
    );
    return result;
  } catch (error) {}
};

export const updateSingleTaskGanttTask = async (id: any, payload: any) => {
  let result;
  try {
    result = await axios.put(
      API_LINK + `/api/npd/updateGanttChart/${id}`,
      payload
    );
    return result;
  } catch (error) {}
};

export const attachmentsFilesNpd = async (payload: any) => {
  let result;
  try {
    result = await axios.post(
      API_LINK +
        `/api/configuration/addMultipleAttachments?realm=${payload.realmName}`,
      payload
    );
    return result;
  } catch (error) {}
};

export const getByNpdId = async (id: string) => {
  let result;
  try {
    result = await axios.get(API_LINK + `/api/npd/${id}`);
    return result;
  } catch (error) {}
};

export const deleteNpdData = async (id: string) => {
  let result;
  try {
    result = await axios.delete(`${API_LINK}/api/npd/deleteNPD/${id}`);
    return result;
  } catch (error) {}
};

/******MinutesOfMeeting******/

export const createMinutesOfMeeting = async (payload: any) => {
  let result;
  try {
    result = await axios.post(
      API_LINK + "/api/npd/createMinutesOfMeeting",
      payload
    );
    return result;
  } catch (error) {}
};

export const updateMinutesOfMeeting = async (id: any, payload: any) => {
  let result;
  try {
    result = await axios.put(
      API_LINK + `/api/npd/updateMinutesOfMeeting/${id}`,
      payload
    );
    return result;
  } catch (error) {}
};

export const deleteMinutesOfMeeting = async (id: string) => {
  let result;
  try {
    result = await axios.delete(
      `${API_LINK}/api/npd/deleteMinutesOfMeeting/${id}`
    );
    return result;
  } catch (error) {}
};

export const getByIdMinutesOfMeeting = async (id: string) => {
  let result;
  try {
    result = await axios.get(
      API_LINK + `/api/npd/getByIdMinutesOfMeeting/${id}`
    );
    return result;
  } catch (error) {}
};

export const getAllMinutesOfMeeting = async (payload: any) => {
  let result;
  try {
    result = await axios.get(
      API_LINK +
        `/api/npd/getAllMinutesOfMeeting?skip=${payload.skip}&limit=${payload.limit}&pic=${payload.pic}&searchTerm=${payload.searchTerm}&associatedDeptFilter=${payload.associatedDeptFilter}&selectedNpd=${payload.selectedNpd}&meetingDates=${payload.meetingDates}`
    );
    return result;
  } catch (error) {}
};

/******Discussion Item******/

export const createDiscussionItem = async (payload: any) => {
  let result;
  try {
    result = await axios.post(
      API_LINK + "/api/npd/createDiscussionItems",
      payload
    );
    return result;
  } catch (error) {}
};

export const updateDiscussionItem = async (id: any, payload: any) => {
  let result;
  try {
    result = await axios.put(
      API_LINK + `/api/npd/updateDiscussionItems/${id}`,
      payload
    );
    return result;
  } catch (error) {}
};

export const deleteDiscussionItem = async (id: string) => {
  let result;
  try {
    result = await axios.delete(
      `${API_LINK}/api/npd/deleteDiscussionItems/${id}`
    );
    return result;
  } catch (error) {}
};

export const getByIdDiscussionItem = async (id: string) => {
  let result;
  try {
    result = await axios.get(
      API_LINK + `/api/npd/getByIdDiscussionItems/${id}`
    );
    return result;
  } catch (error) {}
};

export const getAllDiscussionItem = async () => {
  let result;
  try {
    result = await axios.get(API_LINK + `/api/npd/getAllDiscussionItems`);
    return result;
  } catch (error) {}
};

export const getByIdMomItemsAll = async (
  id: string,
  npdId: string,
  payload: any
) => {
  let result;
  try {
    result = await axios.get(
      API_LINK +
        `/api/npd/getAllMomIdItems/${id}/${npdId}?skip=${payload.skip}&limit=${payload.limit}&deptFilter=${payload.deptFilter}&criticalityFilter=${payload.criticalityFilter}&impactFilter=${payload.impactFilter}&statusFilter=${payload.statusFilter}`
    );
    return result;
  } catch (error) {}
};

export const getAllDiscussedAndDelayedItemByNpd = async (
  id: string,
  payload: any
) => {
  let result;
  try {
    result = await axios.get(
      API_LINK +
        `/api/npd/getAllDiscussedAndDelayedItemsByNpdId/${id}?skip=${payload.skip}&limit=${payload.limit}&status=${payload.status}&criticality=${payload.criticality}`
    );
    return result;
  } catch (error) {}
};

/******Action Plans******/

export const createActionPlans = async (payload: any) => {
  let result;
  try {
    result = await axios.post(API_LINK + "/api/npd/createActionPlans", payload);
    return result;
  } catch (error) {}
};

export const updateActionPlans = async (id: any, payload: any) => {
  let result;
  try {
    result = await axios.put(
      API_LINK + `/api/npd/updateActionPlans/${id}`,
      payload
    );
    return result;
  } catch (error) {}
};

export const deleteActionPlans = async (id: string) => {
  let result;
  try {
    result = await axios.delete(`${API_LINK}/api/npd/deleteActionPlans/${id}`);
    return result;
  } catch (error) {}
};

export const getByIdActionPlans = async (id: string) => {
  let result;
  try {
    result = await axios.get(API_LINK + `/api/npd/getByIdActionPlans/${id}`);
    return result;
  } catch (error) {}
};

export const getAllActionPlans = async (payload: any) => {
  let result;
  try {
    result = await axios.get(
      API_LINK +
        `/api/npd/getAllActionPlans?skip=${payload.skip}&limit=${payload.limit}&search=${payload.search}&responseDpt=${payload.responseDpt}&pic=${payload.pic}&targetDate=${payload.targetDate}&status=${payload.status}`
    );
    return result;
  } catch (error) {}
};

export const getByIdDiscussionItemItemsAll = async (id: string) => {
  let result;
  try {
    result = await axios.get(
      API_LINK + `/api/npd/getAllDiscussionIdItems/${id}`
    );
    return result;
  } catch (error) {}
};
export const getAllDelayedItemItemsAll = async (id: string) => {
  let result;
  try {
    result = await axios.get(API_LINK + `/api/npd/getAllDelayedIdItems/${id}`);
    return result;
  } catch (error) {}
};

export const getByIdActionPlansByNPDIdAll = async (
  id: string,
  payload: any
) => {
  let result;
  try {
    result = await axios.get(
      API_LINK +
        `/api/npd/getAllActionPointsByNpd/${id}?skip=${payload.skip}&limit=${payload.limit}&responseDpt=${payload.responseDpt}&pic=${payload.pic}&targetDate=${payload.targetDate}&status=${payload.status}`
    );
    return result;
  } catch (error) {}
};

export const getAllConfigDptPicUsers = async () => {
  let result;
  try {
    result = await axios.get(
      API_LINK + `/api/configuration/getDptAndPicUsersConfig`
    );
    return result;
  } catch (error) {}
};

/******Delayed Items******/

export const getByNpdIdDelayedItemsAll = async (
  id: string,
  momId: any,
  payload: any
) => {
  let result;
  try {
    result = await axios.get(
      API_LINK +
        `/api/npd/getAllDelayedItems/${id}/${momId}?skip=${payload.skip}&limit=${payload.limit}`
    );
    return result;
  } catch (error) {}
};

export const updateDelayedItem = async (id: any, payload: any) => {
  let result;
  try {
    result = await axios.put(
      API_LINK + `/api/npd/updateDelayedItem/${id}`,
      payload
    );
    return result;
  } catch (error) {}
};

export const deleteDelayedItem = async (id: string) => {
  let result;
  try {
    result = await axios.delete(`${API_LINK}/api/npd/deleteDelayedItem/${id}`);
    return result;
  } catch (error) {}
};

export const getByIdDelayedItem = async (id: string) => {
  let result;
  try {
    result = await axios.get(API_LINK + `/api/npd/getAllDelayedItems/${id}`);
    return result;
  } catch (error) {}
};

/****** Delayed Items Action Plans******/

export const createDelayedActionPlans = async (payload: any) => {
  let result;
  try {
    result = await axios.post(
      API_LINK + "/api/npd/createDelayedActionPlans",
      payload
    );
    return result;
  } catch (error) {}
};

export const updateDelayedActionPlans = async (id: any, payload: any) => {
  let result;
  try {
    result = await axios.put(
      API_LINK + `/api/npd/updateDelayedActionPlans/${id}`,
      payload
    );
    return result;
  } catch (error) {}
};

export const deleteDelayedActionPlans = async (id: string) => {
  let result;
  try {
    result = await axios.delete(
      `${API_LINK}/api/npd/deleteDelayedActionPlans/${id}`
    );
    return result;
  } catch (error) {}
};

export const getByIdDelayedActionPlans = async (id: string) => {
  let result;
  try {
    result = await axios.get(
      API_LINK + `/api/npd/getByIdDelayedActionPlans/${id}`
    );
    return result;
  } catch (error) {}
};

export const getAllDelayedActionPlans = async () => {
  let result;
  try {
    result = await axios.get(API_LINK + `/api/npd/getAllDelayedActionPlans`);
    return result;
  } catch (error) {}
};

export const getByIdDelayedItemItemsAll = async (id: string) => {
  let result;
  try {
    result = await axios.get(
      API_LINK + `/api/npd/getAllActionPlansByDelayedIdItems/${id}`
    );
    return result;
  } catch (error) {}
};

export const getAllByOpenNpdId = async (id: string, momId: string) => {
  let result;
  try {
    result = await axios.get(
      API_LINK + `/api/npd/getAllOpenItemByNpdId/${id}/${momId}`
    );
    return result;
  } catch (error) {}
};

export const getAllByDelayedDataOpenNpdId = async (
  id: string,
  momId: string
) => {
  let result;
  try {
    result = await axios.get(
      API_LINK + `/api/npd/getAllOpenDelayedItemByNpdId/${id}/${momId}`
    );
    return result;
  } catch (error) {}
};

/******* Risk Items***********/

export const createRiskPredictionItems = async (payload: any) => {
  let result;
  try {
    result = await axios.post(
      API_LINK + "/api/npd/createRiskPrediction",
      payload
    );
    return result;
  } catch (error) {}
};

export const updateRiskPredictionItems = async (id: any, payload: any) => {
  let result;
  try {
    result = await axios.put(
      API_LINK + `/api/npd/updateRiskPrediction/${id}`,
      payload
    );
    return result;
  } catch (error) {}
};

export const updateRiskOldParentIdItem = async (id: any) => {
  let result;
  try {
    result = await axios.put(
      API_LINK + `/api/npd/findByParentIdAndUpdate/${id}`
    );
    return result;
  } catch (error) {}
};

export const deleteRiskPredictionItems = async (id: string) => {
  let result;
  try {
    result = await axios.delete(
      `${API_LINK}/api/npd/deleteRiskPrediction/${id}`
    );
    return result;
  } catch (error) {}
};

export const getByIdRiskPredictionItems = async (id: string) => {
  let result;
  try {
    result = await axios.get(API_LINK + `/api/npd/getByIdRiskPrediction/${id}`);
    return result;
  } catch (error) {}
};

export const getByIdRiskPredictionItemsHistory = async (
  id: string,
  payload: any
) => {
  let result;
  try {
    result = await axios.get(
      API_LINK +
        `/api/npd/getByIdRiskPredictionHistory/${id}?skip=${payload.skip}&limit=${payload.limit}`
    );
    return result;
  } catch (error) {}
};

export const getAllRiskPredictionItems = async (payload: any) => {
  let result;
  try {
    result = await axios.get(
      API_LINK +
        `/api/npd/getAllRiskPrediction?skip=${payload.skip}&limit=${payload.limit}&searchTerm=${payload?.searchTerm}&typeFilter=${payload?.typeFilter}&impactFilter=${payload?.impactFilter}&riskPredictionFilter=${payload?.riskPredictionFilter}&statusFilter=${payload?.statusFilter}`
    );
    return result;
  } catch (error) {}
};

export const getChartDataByNpd = async (id: string) => {
  let result;
  try {
    result = await axios.get(
      API_LINK + `/api/npd/getNpdIdDataRadiusChartData/${id}`
    );
    return result;
  } catch (error) {}
};

/*******Risk Items Action Planes********/

export const createRiskActionPlans = async (payload: any) => {
  let result;
  try {
    result = await axios.post(
      API_LINK + "/api/npd/createRiskPredictionActionPlans",
      payload
    );
    return result;
  } catch (error) {}
};

export const updateRiskActionPlans = async (id: any, payload: any) => {
  let result;
  try {
    result = await axios.put(
      API_LINK + `/api/npd/updateRiskPredictionActionPlans/${id}`,
      payload
    );
    return result;
  } catch (error) {}
};

export const deleteRiskActionPlans = async (id: string) => {
  let result;
  try {
    result = await axios.delete(
      `${API_LINK}/api/npd/deleteRiskPredictionActionPlans/${id}`
    );
    return result;
  } catch (error) {}
};

export const getByIdRiskActionPlans = async (id: string) => {
  let result;
  try {
    result = await axios.get(
      API_LINK + `/api/npd/getByIdRiskPredictionActionPlans/${id}`
    );
    return result;
  } catch (error) {}
};

export const getAllRiskActionPlans = async () => {
  let result;
  try {
    result = await axios.get(
      API_LINK + `/api/npd/getAllRiskPredictionActionPlans`
    );
    return result;
  } catch (error) {}
};

export const getByIdRiskItemItemsAll = async (id: string) => {
  let result;
  try {
    result = await axios.get(
      API_LINK + `/api/npd/getAllActionPlansByRiskPredictionIdItems/${id}`
    );
    return result;
  } catch (error) {}
};
export const getAllUsersApi = async () => {
  let result;
  try {
    result = await axios.get(API_LINK + `/api/kpi-report/getAll`);
    return result;
  } catch (e) {
    console.log("error", e);
  }
};
